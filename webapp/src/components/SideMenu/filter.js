export const search = (node, term, foundIDS) => {
  const name = node.com_name || node.prov_name || node.reg_name;
  let isMatching =
    term.length > 2 &&
    name &&
    name.toLowerCase().indexOf(term.toLowerCase()) > -1;
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      const hasMatchingChild = search(child, term, foundIDS);
      isMatching = isMatching || hasMatchingChild;
    });
  }

  // We will add any item if it matches our search term or if it has a children that matches our term
  if (isMatching && name) {
    const id = node.com_istat || node.prov_istat || node.reg_istat || name;
    foundIDS.push(id);
  }
  return isMatching;
};
