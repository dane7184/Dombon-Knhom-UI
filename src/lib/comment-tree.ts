import { EventComment } from "@/types/event.type";

/**
 * Recursively finds a node by id anywhere in the comment tree.
 */
export function findNode(
  nodes: EventComment[],
  id: string,
): EventComment | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.replies, id);
    if (found) return found;
  }
  return null;
}

/**
 * Recursively updates a single node by id, returning a new tree (immutable).
 * `updater` receives the matched node and returns the replacement.
 */
export function updateNode(
  nodes: EventComment[],
  id: string,
  updater: (node: EventComment) => EventComment,
): EventComment[] {
  return nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (node.replies.length > 0) {
      return { ...node, replies: updateNode(node.replies, id, updater) };
    }
    return node;
  });
}

/**
 * Recursively removes a node by id anywhere in the tree, returning a new tree.
 */
export function removeNode(nodes: EventComment[], id: string): EventComment[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.replies.length > 0
        ? { ...node, replies: removeNode(node.replies, id) }
        : node,
    );
}

/**
 * Recursively inserts a new reply as a child of the node with id === parentId.
 * Newest replies are placed at the top of that parent's children (unshift).
 * Marks the parent as repliesLoaded so the new reply is immediately visible
 * without requiring the user to click "View replies".
 */
export function insertReply(
  nodes: EventComment[],
  parentId: string,
  reply: EventComment,
): EventComment[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        hasReply: true,
        repliesLoaded: true,
        replies: [reply, ...node.replies],
      };
    }
    if (node.replies.length > 0) {
      return { ...node, replies: insertReply(node.replies, parentId, reply) };
    }
    return node;
  });
}

/**
 * Merges newly-loaded replies into a node's children (newest first),
 * de-duplicating by id and dropping any leftover temp- placeholders.
 */
export function mergeReplies(
  nodes: EventComment[],
  parentId: string,
  loaded: EventComment[],
  pagination: { hasMoreReplies: boolean; repliesNextCursor: string | null },
): EventComment[] {
  return updateNode(nodes, parentId, (node) => {
    const existingIds = new Set(node.replies.map((r) => r.id));
    const clean = loaded.filter(
      (r) => !existingIds.has(r.id) && !r.id.startsWith("temp-"),
    );
    return {
      ...node,
      replies: [...node.replies, ...clean],
      repliesLoaded: true,
      hasMoreReplies: pagination.hasMoreReplies,
      repliesNextCursor: pagination.repliesNextCursor,
    };
  });
}
