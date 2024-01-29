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
  Detail,
  LocalStorage,
} from "@raycast/api";
import { useState, useEffect } from 'react';
import { useForm, usePromise } from "@raycast/utils";

enum YouModel {
  'gpt-4' = 'you-gpt-4',
  'research' = 'research',
  'create' = 'create',
  'agent' = 'agent',
  'default' = 'default'
}

enum SearchEngine {
  'you' = 'you',
  'phind' = 'phind',
}

enum PhindModel {
  'gpt-4' = 'phind-gpt-4',
  default = 'Phind Model'
}
interface ModelProps {
  model: YouModel | PhindModel;
}
type Values = {
  query: string;
  model?: ModelProps['model'];
  searchEngine: SearchEngine;
  context?: string; // phind 模型的上下文
};


// 返回某个命令 draftValues 是默认值, arguments 是搜索中传入的参数
export default function Command(props: LaunchProps<{ draftValues: Values; arguments: Partial<Values> }>) {
  console.log(111);
  const { handleSubmit, itemProps, setValue, values } = useForm<Values>({
    async onSubmit(params) {
      await popToRoot();
      if (params.searchEngine === SearchEngine.you) {
        await open(`https://you.com/search?q=${params.query}&tbm=youchat&chat_mode=${params.model?.endsWith('gpt-4') ? 'gpt-4' : params.model}`);
      } else {
        await open(`https://www.phind.com/search?q=${params.query}${params.context ? `&c=${params.context}` : ''}&answerModel=${params.model?.endsWith('gpt-4') ? 'gpt-4' : params.model}`);
      }
      // await LocalStorage.setItem('model', params.model);
    },
    initialValues: {
      query: props?.draftValues?.query ||  props.arguments?.query || '',
    },
    validation: {
      query: (value) => (value && value.length > 0 ? null : "Query cannot be empty"),
    },
  });


  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="请进行搜索" />
      <Form.Separator />
      <Form.Dropdown id="searchEngine" title="Search Engine" storeValue onChange={engine => {
        if (engine === SearchEngine.phind) {
          setValue('model', PhindModel.default);
        } else {
          setValue('model', YouModel.default);
        }
      }}>
        <Form.DropdownItem value="you" title="You.com" />
        <Form.DropdownItem value="phind" title="phind.com" />
      </Form.Dropdown>
      <Form.TextArea autoFocus enableMarkdown title="Ask Anything" {...itemProps.query} />
      <Form.TextArea enableMarkdown title="context" id="context" />
      <Form.Dropdown id="model" title="select model" storeValue value={values.model} onChange={model => {
        setValue('model', model as ModelProps['model']);
      }}>
        <Form.DropdownSection title="phind.com">
          <Form.DropdownItem value={PhindModel["gpt-4"]} title="gpt-4" />
          <Form.DropdownItem value={PhindModel.default} title="Phind Model" />
        </Form.DropdownSection>
        <Form.DropdownSection title="you.com">
          <Form.DropdownItem value={YouModel.default} title="Smart" />
          <Form.DropdownItem value={YouModel.agent} title="Genius" />
          <Form.DropdownItem value={YouModel["gpt-4"]} title="GPT-4" />
          <Form.DropdownItem value={YouModel.research} title="research" />
          <Form.DropdownItem value={YouModel.create} title="create" />
        </Form.DropdownSection>
      </Form.Dropdown>
    </Form>
  )
}
