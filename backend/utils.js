export function combineDocuments(docs) {
  return docs.map((doc) => doc.content).join('\n\n---\n\n');
}