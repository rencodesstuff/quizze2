export const isBrowser = typeof window !== 'undefined';

export const getOriginUrl = () => {
  if (!isBrowser) return '';
  return window.location.origin;
};

export const copyToClipboard = async (text: string) => {
  if (!isBrowser) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

export const setBodyScroll = (enabled: boolean) => {
  if (!isBrowser) return;
  document.body.style.overflow = enabled ? 'unset' : 'hidden';
};