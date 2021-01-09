export const search = (node, term, foundIDS)=> {
    let isMatching = term.length > 2 && node.name && node.name.toLowerCase().indexOf(term.toLowerCase()) > -1;
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => {
        const hasMatchingChild = search(child, term, foundIDS);
        isMatching = isMatching || hasMatchingChild;
      });
    }
  
    // We will add any item if it matches our search term or if it has a children that matches our term
    if (isMatching && node.name) {
      const id = node.com_istat_code_num || node.prov_istat_code_num || node.reg_istat_code || node.name;
      foundIDS.push(id);
    }
    return isMatching;
  }
