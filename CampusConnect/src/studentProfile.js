const PROFILE_KEY = 'campusconnect-profile';

export function getStudentProfile({ ask = true } = {}) {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    if (saved?.name && saved?.email) return saved;
    if (!ask) return null;
    const name = window.prompt('Enter your name (saved on this device for future registrations):')?.trim();
    if (!name) return null;
    const email = window.prompt('Enter your email (used to keep your registrations and club follows together):')?.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      window.alert('Please enter a valid email address.');
      return null;
    }
    const profile = { name, email };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem('campusconnect-name', name);
    return profile;
  } catch {
    window.alert('Your browser storage is unavailable. Enable local storage to use registrations.');
    return null;
  }
}
