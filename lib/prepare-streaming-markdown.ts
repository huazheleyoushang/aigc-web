/** 流式输出时补全未闭合的 Markdown 结构，避免预览解析异常 */
export function prepareStreamingMarkdown(content: string): string {
  let result = content;

  const fenceCount = (result.match(/```/g) ?? []).length;
  if (fenceCount % 2 === 1) {
    result += "\n```";
  }

  return result;
}
