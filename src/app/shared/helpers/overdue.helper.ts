function isOverdue(dueDate: string | Date): boolean {
  const currentDate = new Date();
  return new Date(dueDate) < currentDate;
}

export { isOverdue };
