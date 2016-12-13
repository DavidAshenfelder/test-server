const transactionHelper = {
  parser: (transaction) => {
    const keys = Object.keys(transaction);
    if (keys.includes('contactId')) {
      transaction.contactId = Number(transaction.contactId);
    }
    return transaction;
  }
};

export default transactionHelper;
