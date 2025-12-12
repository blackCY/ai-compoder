export const getPreviewText = (children?: React.ReactNode): string => {
  if (children) {
    return '';
  }
  return 'Creating nexus...';
};