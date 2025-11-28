# 提示词通用结构说明文档

> 提示词结构得灵活运用，不要记死结构
> 提示词怎么都行，反正是 AI 生成，重要的是：你得知道当前该做什么

## frontmatter

用于给 agent 描述该提示词文档的作用
name 和 description 必写

## Role

定义 ai 的角色

## Goals

描述目标

## Constraints

- 规范约束
- 实现约束
- ...

## Workflows

任务拆解

### Step 1: {该阶段目标概要}

列表展开详情步骤

### Step 2

...

## Example

可用代码举例说明大致格式

## Initialization

其实之前一直不太理解有些提示词里 Initialization 的作用，其实就是把输入框里告诉 ai 要干什么的部分挪到了 md 文件里
其实就是 assistant prompt，当用户提供对应的信息，就开始初始化、执行
