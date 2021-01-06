// Helper functions for filtering
export const defaultMatcher = (filterText, node) => {
  return node.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
};

export const exactMatcher = (filterText, node, limitFilter) => {
  if (limitFilter) {
    return node.name === filterText && !node.com_istat_code_num;
  } else {
    return node.name === filterText;
  }
};

export const findNode = (node, filter, matcher, limitFilter) => {
  return (
    matcher(filter, node, limitFilter) || // i match
    (node.children && // or i have decendents and one of them match
      node.children.length &&
      !!node.children.find((child) =>
        findNode(child, filter, matcher, limitFilter)
      ))
  );
};

export const filterTree = (
  node,
  filter,
  matcher = exactMatcher,
  limitFilter
) => {
  // If im an exact match then all my children get to stay
  if (matcher(filter, node, limitFilter) || !node.children) {
    return node;
  }
  // If not then only keep the ones that match or have matching descendants
  let filtered;
  // if (limitFilter) {
  //   filtered = [
  //     node.children.find((child) => findNode(child, filter, matcher)),
  //   ];
  // } else {
  filtered = node.children
    .filter((child) => findNode(child, filter, matcher, limitFilter))
    .map((child) => filterTree(child, filter, matcher, limitFilter));
  // }

  return Object.assign({}, node, { children: filtered });
};

export const expandFilteredNodes = (
  node,
  filter,
  matcher = exactMatcher,
  limitFilter
) => {
  let children = node.children;
  if (!children || children.length === 0) {
    return Object.assign({}, node, { toggled: false });
  }
  const childrenWithMatches = node.children.filter((child) =>
    findNode(child, filter, matcher, limitFilter)
  );

  const shouldExpand = childrenWithMatches.length > 0;
  // If im going to expand, go through all the matches and see if thier children need to expand
  if (shouldExpand) {
    children = childrenWithMatches.map((child) => {
      return expandFilteredNodes(child, filter, matcher, limitFilter);
    });
  }
  return Object.assign({}, node, {
    children: children,
    toggled: shouldExpand,
    active: true,
  });
};
