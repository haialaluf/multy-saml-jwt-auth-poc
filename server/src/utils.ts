export const getEmailDomain = (email: string) => {
    if (!email) return '';
    return email?.split('@')[1].split('.')[0];
  }
  