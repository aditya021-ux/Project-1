/* Simple data layer backed by localStorage.
   Data stays in the user's own browser, so there is no server to set up. */
const Store = {
  KEYS: {
    profile: 'freshhire.profile',
    applications: 'freshhire.applications'
  },

  _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn('Could not read storage key', key, err);
      return fallback;
    }
  },

  _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error('Storage is full or unavailable', err);
      return false;
    }
  },

  /* Profile */
  getProfile() {
    return this._read(this.KEYS.profile, null);
  },

  saveProfile(profile) {
    return this._write(this.KEYS.profile, profile);
  },

  /* Applications */
  getApplications() {
    return this._read(this.KEYS.applications, []);
  },

  hasApplied(jobId) {
    return this.getApplications().some(a => a.jobId === jobId);
  },

  addApplication(job) {
    const apps = this.getApplications();
    apps.unshift({
      id: 'app_' + Date.now(),
      jobId: job.id,
      title: job.title,
      company: job.company,
      status: 'Applied',
      appliedAt: Date.now()
    });
    return this._write(this.KEYS.applications, apps);
  },

  updateStatus(id, status) {
    const apps = this.getApplications().map(a => (a.id === id ? { ...a, status } : a));
    return this._write(this.KEYS.applications, apps);
  },

  removeApplication(id) {
    const apps = this.getApplications().filter(a => a.id !== id);
    return this._write(this.KEYS.applications, apps);
  }
};
