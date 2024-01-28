// Action 和 ActionPanel：用于创建表单的提交按钮。
// Form：用于创建表单和表单的各个部分（如文本区域，下拉菜单，复选框）。
// LaunchProps：这是一个类型，用于描述传递给命令的属性。
// getPreferenceValues：这是一个函数，用于获取用户的偏好设置。
// open：这是一个函数，用于打开一个 URL。
// popToRoot：这是一个函数，用于在提交表单后关闭所有打开的面板，返回到 Raycast 的主屏幕
import {
  Action,
  ActionPanel,
  Form,
  LaunchProps,
  getPreferenceValues,
  open,
  popToRoot,
  LocalStorage,
} from "@raycast/api";
import { useState, useEffect } from 'react';
import { useForm } from "@raycast/utils";

interface ModelProps {
  model: 'gpt-4' | 'research' | 'create' | 'agent' | 'default';
}
type Values = {
  query: string;
  model: ModelProps['model'];
};


// 返回某个命令
export default function Command(props: LaunchProps<{ draftValues: Values; arguments: Values }>) {
  const defaultModel = getPreferenceValues<ModelProps>().model
  const [model, setModel] = useState<ModelProps['model'] | undefined>(undefined);
  const { handleSubmit, itemProps, setValue, values } = useForm<Values>({
    async onSubmit(params) {
      await popToRoot();
      await open(`https://you.com/search?q=${params.query}&tbm=youchat&chat_mode=${params.model}`);
      await LocalStorage.setItem('model', params.model);
    },
    initialValues: {
      query: props.draftValues?.query ?? props.fallbackText ?? "",
      model: defaultModel
    },
    validation: {
      query: (value) => (value && value.length > 0 ? null : "Query cannot be empty"),
    },
  });

  if (props.arguments.query) {
    handleSubmit({
      query: props.arguments.query,
      model: props.arguments.model || defaultModel
    });
    return null;
  }

  if (props.fallbackText) {
    handleSubmit({
      query: props.fallbackText as string,
      model: props.arguments.model || defaultModel
    });
    return null;
  }

  useEffect(() => {
    LocalStorage.getItem('model').then(m => {
      if (typeof  m === 'string') {
        setValue('model', () => {
          return m as ModelProps['model'];
        });
        setModel(m as ModelProps['model'])
        LocalStorage.setItem('model', m);
      } else {
        setValue('model', () => {
          return defaultModel;
        })
        setModel(defaultModel)
      }
    })
  }, [])
  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="请使用 you 进行搜索" />
      <Form.TextArea title="Ask Anything" {...itemProps.query} />
      {
        model && (
          <Form.Dropdown id="model" value={model} title="Please select the model" onChange={val => {
            LocalStorage.setItem('model', val);
            setModel(val as ModelProps['model'])
          }}>
            <Form.DropdownItem value="default" title="Smart" />
            <Form.DropdownItem value="agent" title="Genius" />
            <Form.DropdownItem value="gpt-4" title="GPT-4" />
            <Form.DropdownItem value="research" title="research" />
            <Form.DropdownItem value="create" title="create" />
          </Form.Dropdown>
        )
      }
    </Form>
  );
}
