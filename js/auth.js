/* ── auth.js — Local Authentication Engine ── */

const Auth = {

  /* ── Storage helpers ── */
  getUsers(){
    return JSON.parse(localStorage.getItem('aura_users') || '[]');
  },
  saveUsers(users){
    localStorage.setItem('aura_users', JSON.stringify(users));
  },
  getSession(){
    return JSON.parse(sessionStorage.getItem('aura_session') || 'null');
  },
  setSession(user){
    // Never store password in session
    const {password,...safe} = user;
    sessionStorage.setItem('aura_session', JSON.stringify(safe));
  },
  clearSession(){
    sessionStorage.removeItem('aura_session');
  },

  /* ── Register ── */
  register({name, email, password, dob, gender, lookingFor}){
    const users = this.getUsers();
    if(users.find(u => u.email.toLowerCase() === email.toLowerCase())){
      return {ok:false, error:'An account with this email already exists.'};
    }
    if(password.length < 6){
      return {ok:false, error:'Password must be at least 6 characters.'};
    }
    const age = this.calcAge(dob);
    if(age < 18){
      return {ok:false, error:'You must be 18 or older to join Aura.'};
    }
    const user = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: this.hashPassword(password), // simple hash for demo
      dob, age, gender, lookingFor,
      avatar: this.randomEmoji(),
      bio: '',
      interests: [],
      location: '',
      createdAt: new Date().toISOString(),
      matches: [],
      likes: [],
    };
    users.push(user);
    this.saveUsers(users);
    this.setSession(user);
    return {ok:true, user};
  },

  /* ── Login ── */
  login({email, password}){
    const users = this.getUsers();
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if(!user){
      return {ok:false, error:'No account found with this email.'};
    }
    if(user.password !== this.hashPassword(password)){
      return {ok:false, error:'Incorrect password. Please try again.'};
    }
    this.setSession(user);
    return {ok:true, user};
  },

  /* ── Logout ── */
  logout(){
    this.clearSession();
    window.location.href = '../index.html';
  },

  /* ── Guard: redirect if not logged in ── */
  requireAuth(){
    const session = this.getSession();
    if(!session){
      window.location.href = '../pages/login.html';
      return null;
    }
    return session;
  },

  /* ── Guard: redirect if already logged in ── */
  requireGuest(){
    const session = this.getSession();
    if(session){
      window.location.href = '../pages/app.html';
    }
  },

  /* ── Helpers ── */
  calcAge(dob){
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  },

  // Simple (non-cryptographic) hash for demo — in production use bcrypt via backend
  hashPassword(pw){
    let h = 0;
    for(let i = 0; i < pw.length; i++){
      h = Math.imul(31, h) + pw.charCodeAt(i) | 0;
    }
    return 'h_' + Math.abs(h).toString(36) + pw.length;
  },

  randomEmoji(){
    const emojis = ['🌸','🌊','🎵','🦋','🌙','⚡','🌺','🎨','🌿','🔮','🦄','🌈','🎭','🌟','🍀'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  },

  /* ── Update user profile ── */
  updateProfile(data){
    const session = this.getSession();
    if(!session) return {ok:false};
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === session.id);
    if(idx === -1) return {ok:false};
    Object.assign(users[idx], data);
    this.saveUsers(users);
    this.setSession(users[idx]);
    return {ok:true, user:users[idx]};
  },

  /* ── Get full user (with password field) ── */
  getFullUser(id){
    return this.getUsers().find(u => u.id === id) || null;
  }
};

// Seed demo profiles if first visit
(function seedDemoData(){
  if(localStorage.getItem('aura_seeded')) return;
  const demos = [
    {id:'demo_1',name:'Priya Sharma',email:'priya@demo.com',password:'demo',dob:'1999-03-12',age:25,gender:'woman',lookingFor:'man',avatar:'🌸',bio:'Art lover, travel addict, coffee snob ☕',interests:['Art','Travel','Photography','Music'],location:'Mumbai',matches:[],likes:[],createdAt:new Date().toISOString()},
    {id:'demo_2',name:'Arjun Kapoor',email:'arjun@demo.com',password:'demo',dob:'1997-07-22',age:26,gender:'man',lookingFor:'woman',avatar:'🎵',bio:'Musician by night, coder by day. I make playlists for every mood.',interests:['Music','Coding','Coffee','Cycling'],location:'Delhi',matches:[],likes:[],createdAt:new Date().toISOString()},
    {id:'demo_3',name:'Neha Reddy',email:'neha@demo.com',password:'demo',dob:'2000-11-05',age:23,gender:'woman',lookingFor:'anyone',avatar:'📚',bio:'Book worm, yoga enthusiast, and terrible cook 🍳',interests:['Books','Yoga','Cooking','Movies'],location:'Bangalore',matches:[],likes:[],createdAt:new Date().toISOString()},
    {id:'demo_4',name:'Rohan Verma',email:'rohan@demo.com',password:'demo',dob:'1998-05-18',age:26,gender:'man',lookingFor:'woman',avatar:'🏔️',bio:'Hiking trails > nightclubs. Mountains are my happy place.',interests:['Hiking','Photography','Travel','Gaming'],location:'Pune',matches:[],likes:[],createdAt:new Date().toISOString()},
    {id:'demo_5',name:'Aisha Khan',email:'aisha@demo.com',password:'demo',dob:'2001-01-30',age:23,gender:'woman',lookingFor:'anyone',avatar:'🌙',bio:'Stargazer, poet, overthinker. Let\'s talk about the universe.',interests:['Astronomy','Poetry','Philosophy','Dancing'],location:'Hyderabad',matches:[],likes:[],createdAt:new Date().toISOString()},
    {id:'demo_6',name:'Vikram Singh',email:'vikram@demo.com',password:'demo',dob:'1996-09-14',age:28,gender:'man',lookingFor:'woman',avatar:'🎨',bio:'Graphic designer with an obsession for vintage films and street food.',interests:['Design','Films','Food','Travel'],location:'Jaipur',matches:[],likes:[],createdAt:new Date().toISOString()},
  ];
  const existing = JSON.parse(localStorage.getItem('aura_users') || '[]');
  localStorage.setItem('aura_users', JSON.stringify([...existing, ...demos]));
  localStorage.setItem('aura_seeded', '1');
})();
