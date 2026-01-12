/* --- CONFIGURACIÓN Y BASE DE DATOS LOCAL --- */
const DB_KEY = 'LevilApp_v1';

// Base de datos inicial
const initialData = {
    users: [
        { 
            username: "Estudiante", 
            password: "123", 
            name: "Juan Pérez",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
            favorites: [],
            notes: [] 
        }
    ],
    currentUser: null 
};

// Cargar datos
let db = JSON.parse(localStorage.getItem(DB_KEY)) || initialData;

// --- BIBLIOTECA DE LIBROS (DATOS) ---
const library = [
    {
        id: 101,
        title: "Hábitos Atómicos",
        author: "James Clear",
        skill: "Hábitos",
        cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80",
        desc: "Un método fácil y comprobado para desarrollar buenos hábitos y romper los malos.",
        chapters: [
            { id: 1, title: "Cap 1: El poder de un 1%", content: "Mejorar un 1% cada día resulta en un cambio significativo a largo plazo. Si mejoras un 1% cada día durante un año, terminarás 37 veces mejor al final del año." },
            { id: 2, title: "Cap 2: La identidad", content: "La forma más efectiva de cambiar tus hábitos es enfocarte no en lo que quieres lograr, sino en quién te quieres convertir." }
        ]
    },
    {
        id: 102,
        title: "El Arte de la Guerra",
        author: "Sun Tzu",
        skill: "Estrategia",
        cover: "https://pdlibrosecu.cdnstatics2.com/usuaris/libros/thumbs/9f29a8ad-b649-41f6-84e2-ea57d469fef8/d_360_620/292053_portada_el-arte-de-la-guerra_sun-tzu_202310231045.webp",
        desc: "El tratado de estrategia militar más antiguo del mundo.",
        chapters: [
            { id: 1, title: "Cap 1: Evaluación", content: "La guerra es un asunto de vital importancia para el Estado. Quien hace muchos cálculos antes de la batalla, gana." },
            { id: 2, title: "Cap 2: Iniciando acciones", content: "La victoria es el objetivo principal de la guerra. Si la victoria se demora, las armas de los hombres se embotan." }
        ]
    },
    {
        id: 103,
        title: "El Hombre en busca de Sentido",
        author: "Viktor Frankl",
        skill: "Resiliencia",
        cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80",
        desc: "Las memorias de Frankl sobre su vida en los campos de concentración.",
        chapters: [
            { id: 1, title: "Cap 1: Un psicólogo en el campo", content: "Este libro no trata de hechos y eventos externos, sino de experiencias personales y cómo afectaban la mente del prisionero." },
            { id: 2, title: "Cap 2: La apatía", content: "La apatía surgía como un mecanismo de autodefensa necesario. Las emociones debían apagarse para sobrevivir." }
        ]
    },
    {
        id: 104,
        title: "Pensar Rápido, Pensar Despacio",
        author: "Daniel Kahneman",
        skill: "Estrategia",
        cover: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&w=300&q=80",
        desc: "Un recorrido por los dos sistemas que modelan cómo pensamos.",
        chapters: [
            { id: 1, title: "Cap 1: Los dos personajes", content: "El Sistema 1 opera de manera rápida y automática. El Sistema 2 asigna atención a las actividades mentales esforzadas." }
        ]
    }
];

let currentBook = null;
let currentChapterIndex = 0;

/* --- SISTEMA DE AUTENTICACIÓN --- */
const Auth = {
    login: () => {
        const u = document.getElementById('login-user').value.trim();
        const p = document.getElementById('login-pass').value;
        
        if (!u || !p) return alert("Por favor llena todos los campos");
        
        const user = db.users.find(usr => usr.username === u && usr.password === p);
        
        if (user) {
            db.currentUser = user;
            Sys.save();
            Nav.to('view-dashboard');
            User.initDashboard();
        } else {
            alert("Usuario o contraseña incorrectos.\n(Prueba: Estudiante / 123)");
        }
    },
    register: () => {
    const u = document.getElementById('reg-user').value.trim();
    const p = document.getElementById('reg-pass').value;
    
    if(!u || !p) return alert("Llena todos los campos");
    if(db.users.find(usr => usr.username === u)) return alert("El usuario ya existe."); 
    
    // 1. Guardar usuario nuevo en la "base de datos"
    db.users.push({
        username: u, password: p, name: u, 
        avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=200&q=80",
        favorites: [], notes: []
    });
    Sys.save();
    
    // 2. TRUCO DE UX: Copiar los datos al formulario de Login
    document.getElementById('login-user').value = u;
    document.getElementById('login-pass').value = p;
    
    // 3. Limpiar formulario de registro
    document.getElementById('reg-user').value = "";
    document.getElementById('reg-pass').value = "";
    
    // 4. Cambiar de vista
    Auth.toggleForm();
    },
    logout: () => {
        db.currentUser = null;
        Sys.save();
        Nav.to('view-auth');
        document.getElementById('login-user').value = "";
        document.getElementById('login-pass').value = "";
    },
    toggleForm: () => {
        document.getElementById('form-login').classList.toggle('hidden');
        document.getElementById('form-register').classList.toggle('hidden');
    }
};

/* --- NAVEGACIÓN --- */
const Nav = {
    history: [],
    to: (viewId) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const target = document.getElementById(viewId);
        if(target) target.classList.add('active');
        
        if (Nav.history[Nav.history.length - 1] !== viewId) Nav.history.push(viewId);
        
        if(viewId === 'view-profile') User.renderProfile();
        if(viewId === 'view-dashboard') Books.render(library);
    },
    back: () => {
        if(Nav.history.length <= 1) return;
        Nav.history.pop(); 
        const prev = Nav.history[Nav.history.length - 1] || 'view-dashboard';
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(prev).classList.add('active');
        AudioPlayer.stop();
    }
};

/* --- LÓGICA DE LIBROS --- */
const Books = {
    render: (list) => {
        const container = document.getElementById('books-container');
        if(!container) return;
        container.innerHTML = "";
        list.forEach(book => {
            const div = document.createElement('div');
            div.className = 'book-item';
            div.onclick = () => Books.openDetail(book.id);
            div.innerHTML = `
                <div class="skill-badge">⚡ ${book.skill}</div>
                <img src="${book.cover}" class="book-cover">
                <div style="font-weight:bold; font-size:0.9rem;">${book.title}</div>
                <div style="font-size:0.8rem; color:gray;">${book.author}</div>
            `;
            container.appendChild(div);
        });
    },
    filter: (cat, el) => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        el.classList.add('active');
        if(cat === 'Todos') Books.render(library);
        else Books.render(library.filter(b => b.skill === cat));
    },
    openDetail: (id) => {
        currentBook = library.find(b => b.id === id);
        if (!currentBook) return console.error("Libro no encontrado");

        const setTxt = (id, txt) => { const el = document.getElementById(id); if(el) el.innerText = txt; };
        
        const img = document.getElementById('detail-img');
        if(img) img.src = currentBook.cover;

        setTxt('detail-title', currentBook.title);
        setTxt('detail-author', currentBook.author);
        setTxt('detail-badge', "HABILIDAD: " + (currentBook.skill || "").toUpperCase());
        setTxt('detail-desc', currentBook.desc);
        
        // Renderizar Capítulos
        const list = document.getElementById('chapter-list');
        if(list) {
            list.innerHTML = "";
            const chapters = currentBook.chapters || [];
            
            if(chapters.length === 0) {
                list.innerHTML = "<p style='padding:20px; text-align:center; color:#666;'>No hay capítulos disponibles.</p>";
            } else {
                chapters.forEach((chap, index) => {
                    const item = document.createElement('div');
                    item.className = 'chapter-item';
                    item.innerHTML = `<span>${chap.title}</span> <i class="fas fa-chevron-right"></i>`;
                    item.onclick = () => Reader.open(index);
                    list.appendChild(item);
                });
            }
        }
        User.updateFavIcon();
        Nav.to('view-detail');
    }
};

/* --- LECTOR Y NOTAS --- */
const Reader = {
    open: (chapterIndex) => {
        currentChapterIndex = chapterIndex;
        Reader.renderChapter();
        Nav.to('view-reader');
    },
    renderChapter: () => {
        const chapter = currentBook.chapters[currentChapterIndex];
        document.getElementById('reader-chapter-title').innerText = chapter.title;
        document.getElementById('reader-content').innerHTML = `
            <p>${chapter.content}</p>
            <br><br><hr style='border-color:#333'>
            <p style='text-align:center; color:#555'>Fin del capítulo</p>
        `;
        
        const prevBtn = document.getElementById('prev-chapter-btn');
        const nextBtn = document.getElementById('next-chapter-btn');
        if(prevBtn) prevBtn.disabled = currentChapterIndex === 0;
        if(nextBtn) nextBtn.disabled = currentChapterIndex === currentBook.chapters.length - 1;
        
        const contentDiv = document.getElementById('reader-content');
        if(contentDiv) contentDiv.scrollTop = 0;
    },
    nextChapter: () => {
        if (currentChapterIndex < currentBook.chapters.length - 1) {
            currentChapterIndex++;
            Reader.renderChapter();
        }
    },
    prevChapter: () => {
        if (currentChapterIndex > 0) {
            currentChapterIndex--;
            Reader.renderChapter();
        }
    }
};

const Journal = {
    toggle: () => document.getElementById('journal-drawer').classList.toggle('minimized'),
    save: () => {
        const txt = document.getElementById('journal-input').value;
        if(!txt) return;
        
        db.currentUser.notes.push({
            book: currentBook.title,
            chapter: currentBook.chapters[currentChapterIndex].title,
            text: txt,
            date: new Date().toLocaleDateString()
        });
        Sys.save();
        
        const successMsg = document.getElementById('journal-success');
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 2000);
        
        document.getElementById('journal-input').value = "";
        Journal.toggle();
    }
};

/* --- USUARIO --- */
const User = {
    initDashboard: () => {
        if(db.currentUser) {
            const avatar = document.getElementById('dash-avatar');
            if(avatar) avatar.style.backgroundImage = `url('${db.currentUser.avatar}')`;
        }
    },
    updateFavIcon: () => {
        const icon = document.getElementById('fav-icon');
        if (!db.currentUser || !icon) return;

        const favs = db.currentUser.favorites || [];
        if (favs.includes(currentBook.id)) {
            icon.classList.remove('far'); icon.classList.add('fas'); icon.style.color = '#00f2ff';
        } else {
            icon.classList.remove('fas'); icon.classList.add('far'); icon.style.color = 'white';
        }
    },
    toggleFavorite: () => {
        const fid = currentBook.id;
        const index = db.currentUser.favorites.indexOf(fid);
        if(index === -1) db.currentUser.favorites.push(fid);
        else db.currentUser.favorites.splice(index, 1);
        Sys.save();
        User.updateFavIcon();
    },
    handleImageUpload: (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            db.currentUser.avatar = e.target.result;
            Sys.save();
            User.renderProfile();
            User.initDashboard();
        };
        reader.readAsDataURL(file);
    },
    renderProfile: () => {
        const u = db.currentUser;
        document.getElementById('profile-pic').style.backgroundImage = `url('${u.avatar}')`;
        document.getElementById('edit-name').value = u.name;

        const nList = document.getElementById('notes-list');
        nList.innerHTML = u.notes.length ? "" : "<p style='color:gray; font-size:0.8rem'>No hay notas.</p>";
        u.notes.forEach((n, i) => {
            nList.innerHTML += `
                <div class="stat-card">
                    <strong style="color:var(--accent-blue)">${n.book}</strong>
                    <div style="font-size:0.85rem; color:#888;">${n.chapter}</div>
                    <div style="margin-top:5px">${n.text}</div>
                    <span class="delete-btn" onclick="User.deleteNote(${i})"><i class="fas fa-trash"></i></span>
                </div>`;
        });

        const fList = document.getElementById('fav-list');
        fList.innerHTML = u.favorites.length ? "" : "<p style='color:gray; font-size:0.8rem'>No hay favoritos.</p>";
        u.favorites.forEach(fid => {
            const b = library.find(x => x.id === fid);
            if(b) fList.innerHTML += `<div class="stat-card" onclick="Books.openDetail(${b.id})"><i class="fas fa-book"></i> ${b.title}</div>`;
        });
    },
    updateProfile: () => {
        db.currentUser.name = document.getElementById('edit-name').value;
        Sys.save();
        const successMsg = document.getElementById('profile-success');
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 2000);
        User.initDashboard();
    },
    deleteNote: (idx) => {
        db.currentUser.notes.splice(idx, 1);
        Sys.save();
        User.renderProfile();
    }
};

/* --- AUDIO --- */
const AudioPlayer = {
    isPlaying: false,
    toggle: () => {
        const audio = document.getElementById('real-audio');
        const icon = document.getElementById('audio-icon');
        if(!audio) return;
        
        if(AudioPlayer.isPlaying) {
            audio.pause();
            icon.classList.remove('fa-pause'); icon.classList.add('fa-play');
        } else {
            audio.play().catch(e => console.error("Error audio:", e));
            icon.classList.remove('fa-play'); icon.classList.add('fa-pause');
        }
        AudioPlayer.isPlaying = !AudioPlayer.isPlaying;
    },
    stop: () => {
        const audio = document.getElementById('real-audio');
        if(audio) { audio.pause(); audio.currentTime = 0; }
        AudioPlayer.isPlaying = false;
        const icon = document.getElementById('audio-icon');
        if(icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); }
    }
};

/* --- HELPERS --- */
const Sys = {
    save: () => {
        if (db.currentUser) {
            const idx = db.users.findIndex(u => u.username === db.currentUser.username);
            if(idx !== -1) db.users[idx] = db.currentUser;
        }
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
};

// INIT
window.addEventListener('DOMContentLoaded', () => {
    if(db.currentUser) {
        Nav.to('view-dashboard');
        User.initDashboard();
    } else {
        Nav.to('view-auth');
    }
});