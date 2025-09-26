// Local storage data layer to replace server APIs
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  year: number;
  branch: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  year: number;
  semester: number;
  branch: string;
  icon: string;
  createdAt: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  resourceType: string;
  subjectId: string;
  uploadedBy: string;
  downloadCount: number;
  fileData: string; // Base64 encoded file data
  createdAt: string;
}

interface Download {
  id: string;
  resourceId: string;
  userId: string;
  createdAt: string;
}

class LocalStorageDB {
  private storageKeys = {
    users: 'campusVault_users',
    subjects: 'campusVault_subjects', 
    resources: 'campusVault_resources',
    downloads: 'campusVault_downloads',
    currentUser: 'campusVault_currentUser'
  };

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.getFromStorage<User>(this.storageKeys.users);
    
    // Check if user exists
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveToStorage(this.storageKeys.users, users);
    return newUser;
  }

  async loginUser(username: string, password: string): Promise<User> {
    const users = this.getFromStorage<User>(this.storageKeys.users);
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // In a real app, you'd verify password hash
    // For this demo, we'll just store the current user
    localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.storageKeys.currentUser);
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKeys.currentUser);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getFromStorage<User>(this.storageKeys.users);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveToStorage(this.storageKeys.users, users);

    // Update current user if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(users[userIndex]));
    }

    return users[userIndex];
  }

  // Subject methods
  async createSubject(subjectData: Omit<Subject, 'id' | 'createdAt'>): Promise<Subject> {
    const subjects = this.getFromStorage<Subject>(this.storageKeys.subjects);
    
    const newSubject: Subject = {
      ...subjectData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    subjects.push(newSubject);
    this.saveToStorage(this.storageKeys.subjects, subjects);
    return newSubject;
  }

  async getSubjects(year?: number, semester?: number, branch?: string): Promise<Subject[]> {
    const subjects = this.getFromStorage<Subject>(this.storageKeys.subjects);
    
    return subjects.filter(subject => {
      if (year && subject.year !== year) return false;
      if (semester && subject.semester !== semester) return false;
      if (branch && subject.branch !== branch) return false;
      return true;
    });
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const subjects = this.getFromStorage<Subject>(this.storageKeys.subjects);
    return subjects.find(s => s.id === id) || null;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const subjects = this.getFromStorage<Subject>(this.storageKeys.subjects);
    const subjectIndex = subjects.findIndex(s => s.id === id);
    
    if (subjectIndex === -1) {
      throw new Error('Subject not found');
    }

    subjects[subjectIndex] = { ...subjects[subjectIndex], ...updates };
    this.saveToStorage(this.storageKeys.subjects, subjects);
    return subjects[subjectIndex];
  }

  // Resource methods
  async createResource(resourceData: Omit<Resource, 'id' | 'createdAt' | 'downloadCount'>): Promise<Resource> {
    const resources = this.getFromStorage<Resource>(this.storageKeys.resources);
    
    const newResource: Resource = {
      ...resourceData,
      id: this.generateId(),
      downloadCount: 0,
      createdAt: new Date().toISOString()
    };

    resources.push(newResource);
    this.saveToStorage(this.storageKeys.resources, resources);
    return newResource;
  }

  async getResourcesBySubject(subjectId: string): Promise<Resource[]> {
    const resources = this.getFromStorage<Resource>(this.storageKeys.resources);
    return resources.filter(r => r.subjectId === subjectId);
  }

  async getUserResources(userId: string): Promise<Resource[]> {
    const resources = this.getFromStorage<Resource>(this.storageKeys.resources);
    return resources.filter(r => r.uploadedBy === userId);
  }

  async getResourceById(id: string): Promise<Resource | null> {
    const resources = this.getFromStorage<Resource>(this.storageKeys.resources);
    return resources.find(r => r.id === id) || null;
  }

  async incrementDownloadCount(resourceId: string, userId: string): Promise<void> {
    // Update resource download count
    const resources = this.getFromStorage<Resource>(this.storageKeys.resources);
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    
    if (resourceIndex !== -1) {
      resources[resourceIndex].downloadCount++;
      this.saveToStorage(this.storageKeys.resources, resources);
    }

    // Record the download
    const downloads = this.getFromStorage<Download>(this.storageKeys.downloads);
    const newDownload: Download = {
      id: this.generateId(),
      resourceId,
      userId,
      createdAt: new Date().toISOString()
    };
    
    downloads.push(newDownload);
    this.saveToStorage(this.storageKeys.downloads, downloads);
  }

  // Stats methods
  async getUserStats(userId: string): Promise<{uploads: number, downloads: number, totalDownloads: number}> {
    const resources = this.getFromStorage<Resource>(this.storageKeys.resources);
    const downloads = this.getFromStorage<Download>(this.storageKeys.downloads);

    const uploads = resources.filter(r => r.uploadedBy === userId).length;
    const userDownloads = downloads.filter(d => d.userId === userId).length;
    const totalDownloads = resources
      .filter(r => r.uploadedBy === userId)
      .reduce((sum, r) => sum + r.downloadCount, 0);

    return { uploads, downloads: userDownloads, totalDownloads };
  }

  // File handling utilities
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  downloadFile(resource: Resource): void {
    const link = document.createElement('a');
    link.href = resource.fileData;
    link.download = resource.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Initialize with demo data
  async seedData(): Promise<void> {
    const users = this.getFromStorage<User>(this.storageKeys.users);
    
    if (users.length === 0) {
      // Create admin user
      await this.createUser({
        username: 'admin',
        email: 'admin@campusvault.com',
        fullName: 'Campus Admin',
        year: 1,
        branch: 'CSE',
        isAdmin: true
      });

      console.log('✅ Demo admin user created (username: admin)');
    }
  }
}

// Export singleton instance
export const localDB = new LocalStorageDB();

// Initialize demo data
localDB.seedData();