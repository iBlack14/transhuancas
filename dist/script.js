const menu = document.querySelector('.menu-btn');
const header = document.querySelector('.site-header');
menu?.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
  menu.textContent = open ? '×' : '☰';
  document.body.classList.toggle('menu-open', open);
});
const closeMenu = () => {
  header?.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (menu) { menu.textContent = '☰'; menu.setAttribute('aria-expanded', 'false'); }
};
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', e => {
  if (header?.classList.contains('open') && !header.contains(e.target)) closeMenu();
});

const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const fleet = {
  sedan:{name:'Servicio urbano',capacity:15,luggage:12,image:'/fotos/editadas/1-profesional.webp',number:'01'},
  suv:{name:'Ruta andina',capacity:15,luggage:12,image:'/fotos/editadas/2-profesional.webp',number:'02'},
  van:{name:'Toyota Hiace TransHuancas',capacity:15,luggage:12,image:'/fotos/editadas/4-profesional.webp',number:'03'}
};
const fleetButtons = document.querySelectorAll('.fleet-tabs button');
if (fleetButtons.length === 3) {
  fleetButtons[0].textContent = 'Servicio urbano';
  fleetButtons[1].textContent = 'Ruta andina';
  fleetButtons[2].textContent = 'Van para grupos';
  const initialFleetImage = document.querySelector('#fleet-image');
  if (initialFleetImage) {
    initialFleetImage.src = fleet.sedan.image;
    initialFleetImage.alt = fleet.sedan.name;
  }
  document.querySelector('#fleet-name').textContent = fleet.sedan.name;
  document.querySelector('#capacity').textContent = fleet.sedan.capacity;
  document.querySelector('#luggage').textContent = fleet.sedan.luggage;
}
document.querySelectorAll('.fleet-tabs button').forEach(btn => btn.addEventListener('click', () => {
  document.querySelector('.fleet-tabs .active')?.classList.remove('active'); btn.classList.add('active');
  const item=fleet[btn.dataset.fleet], img=document.querySelector('#fleet-image'); img.style.opacity=0;
  setTimeout(()=>{img.src=item.image;img.alt=item.name;img.style.opacity=1},220);
  document.querySelector('#fleet-name').textContent=item.name; document.querySelector('#capacity').textContent=item.capacity;
  document.querySelector('#luggage').textContent=item.luggage; document.querySelector('.fleet-number').textContent=item.number;
}));

document.querySelector('#booking-form')?.addEventListener('submit', e => {
  e.preventDefault(); const data=new FormData(e.currentTarget);
  const msg=`Hola, deseo cotizar un viaje de ${data.get('origen')} a ${data.get('destino')} para el ${data.get('fecha')} (${data.get('pasajeros')}).`;
  document.querySelector('#form-note').textContent='Abriendo WhatsApp para continuar tu cotización…';
  window.open(`https://wa.me/51918174705?text=${encodeURIComponent(msg)}`,'_blank','noopener');
});

const quoteForm = document.querySelector('#quote-form');
const requestedService = new URLSearchParams(location.search).get('servicio');
if (quoteForm && requestedService) quoteForm.elements.servicio.value = requestedService;
quoteForm?.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(e.currentTarget);
  const msg = `Hola, deseo cotizar: ${d.get('servicio')}\nOrigen: ${d.get('origen')}\nDestino: ${d.get('destino')}\nFecha: ${d.get('fecha')}\nPasajeros: ${d.get('pasajeros')}\nDetalles: ${d.get('detalles') || 'Sin detalles adicionales'}`;
  document.querySelector('#quote-note').textContent = 'Abriendo WhatsApp con los datos de tu viaje…';
  window.open(`https://wa.me/51918174705?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});

// Calendario propio para mantener el diseño corporativo también en móviles.
const calendarMonths = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const padDate = value => String(value).padStart(2, '0');
const toISODate = date => `${date.getFullYear()}-${padDate(date.getMonth()+1)}-${padDate(date.getDate())}`;
const formatDate = value => {
  if (!value) return 'Seleccionar fecha';
  const [year, month, day] = value.split('-').map(Number);
  return `${day} de ${calendarMonths[month-1].toLowerCase()} de ${year}`;
};

document.querySelectorAll('input[type="date"]').forEach(source => {
  source.classList.add('native-date-source');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'date-trigger';
  trigger.innerHTML = `<span>${formatDate(source.value)}</span><b aria-hidden="true">⌄</b>`;
  source.insertAdjacentElement('afterend', trigger);

  let view = source.value ? new Date(`${source.value}T12:00:00`) : new Date();
  const dialog = document.createElement('div');
  dialog.className = 'date-picker';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-label', 'Seleccionar fecha');
  dialog.innerHTML = `<div class="date-picker-head"><button type="button" data-move="-1" aria-label="Mes anterior">←</button><strong></strong><button type="button" data-move="1" aria-label="Mes siguiente">→</button></div><div class="date-week"><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sá</span><span>Do</span></div><div class="date-days"></div><div class="date-actions"><button type="button" data-action="clear">Borrar</button><button type="button" data-action="today">Hoy</button></div>`;
  document.body.appendChild(dialog);

  const renderCalendar = () => {
    dialog.querySelector('.date-picker-head strong').textContent = `${calendarMonths[view.getMonth()]} ${view.getFullYear()}`;
    const days = dialog.querySelector('.date-days');
    days.innerHTML = '';
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - offset);
    for (let index=0; index<42; index++) {
      const date = new Date(start); date.setDate(start.getDate()+index);
      const iso = toISODate(date);
      const day = document.createElement('button');
      day.type = 'button'; day.textContent = date.getDate(); day.dataset.date = iso;
      if (date.getMonth() !== view.getMonth()) day.classList.add('outside');
      if (iso === toISODate(new Date())) day.classList.add('today');
      if (iso === source.value) day.classList.add('selected');
      days.appendChild(day);
    }
  };
  const closeCalendar = () => { dialog.classList.remove('open'); trigger.setAttribute('aria-expanded','false'); };
  trigger.addEventListener('click', event => {
    event.stopPropagation();
    document.querySelectorAll('.date-picker.open').forEach(item => { if (item !== dialog) item.classList.remove('open'); });
    const rect = trigger.getBoundingClientRect();
    dialog.style.setProperty('--picker-top', `${rect.bottom + 10}px`);
    dialog.style.setProperty('--picker-left', `${Math.min(rect.left, window.innerWidth - 350)}px`);
    dialog.classList.toggle('open'); trigger.setAttribute('aria-expanded', dialog.classList.contains('open'));
    renderCalendar();
  });
  dialog.addEventListener('click', event => {
    event.stopPropagation();
    const move = event.target.closest('[data-move]');
    if (move) { view = new Date(view.getFullYear(), view.getMonth()+Number(move.dataset.move), 1); renderCalendar(); return; }
    const dateButton = event.target.closest('[data-date]');
    if (dateButton) { source.value = dateButton.dataset.date; trigger.querySelector('span').textContent = formatDate(source.value); source.dispatchEvent(new Event('change',{bubbles:true})); closeCalendar(); return; }
    if (event.target.dataset.action === 'today') { const today=new Date(); source.value=toISODate(today); view=today; trigger.querySelector('span').textContent=formatDate(source.value); closeCalendar(); }
    if (event.target.dataset.action === 'clear') { source.value=''; trigger.querySelector('span').textContent=formatDate(''); closeCalendar(); }
  });
  document.addEventListener('click', closeCalendar);
});

document.querySelectorAll('input[name="pasajeros"][type="number"]').forEach(input => {
  const stepper = document.createElement('div');
  stepper.className = 'passenger-stepper';
  const minus = document.createElement('button');
  const plus = document.createElement('button');
  minus.type = plus.type = 'button';
  minus.textContent = '−'; plus.textContent = '+';
  minus.setAttribute('aria-label','Quitar pasajero');
  plus.setAttribute('aria-label','Agregar pasajero');
  input.parentNode.insertBefore(stepper, input);
  stepper.append(minus, input, plus);
  const update = amount => {
    const min = Number(input.min || 1), max = Number(input.max || 60);
    input.value = Math.min(max, Math.max(min, Number(input.value || min) + amount));
    input.dispatchEvent(new Event('change',{bubbles:true}));
  };
  minus.addEventListener('click', () => update(-1));
  plus.addEventListener('click', () => update(1));
  input.addEventListener('input', () => {
    input.value = input.value.replace?.(/[^0-9]/g,'') || input.value;
  });
});

const placeCache = new Map();
document.querySelectorAll('input[name="origen"], input[name="destino"]').forEach(input => {
  input.setAttribute('autocomplete','off');
  input.setAttribute('role','combobox');
  input.setAttribute('aria-autocomplete','list');
  const box = document.createElement('div');
  box.className = 'place-suggestions';
  box.setAttribute('role','listbox');
  input.parentElement.classList.add('place-field');
  input.parentElement.appendChild(box);
  let timer, controller, active = -1;

  const close = () => { box.classList.remove('open'); input.setAttribute('aria-expanded','false'); active=-1; };
  const choose = button => {
    input.value = button.dataset.value;
    input.dataset.lat = button.dataset.lat;
    input.dataset.lon = button.dataset.lon;
    close(); input.dispatchEvent(new Event('change',{bubbles:true}));
  };
  const escapePlace = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const render = results => {
    if (!results.length) {
      box.innerHTML = '<p class="place-empty">No encontramos coincidencias. Puedes escribir el lugar manualmente.</p>';
    } else {
      box.innerHTML = results.map((place,index) => {
        const parts = place.display_name.split(',').map(item => item.trim());
        const title = parts[0];
        const detail = parts.slice(1,4).join(', ');
        return `<button type="button" role="option" data-index="${index}" data-value="${escapePlace(place.display_name)}" data-lat="${escapePlace(place.lat)}" data-lon="${escapePlace(place.lon)}"><span class="place-pin">●</span><span><strong>${escapePlace(title)}</strong><small>${escapePlace(detail)}</small></span><b>↗</b></button>`;
      }).join('') + '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">Datos © OpenStreetMap</a>';
      box.querySelectorAll('button').forEach(button => button.addEventListener('click', () => choose(button)));
    }
    box.classList.add('open'); input.setAttribute('aria-expanded','true');
  };
  const search = async () => {
    const query = input.value.trim();
    if (query.length < 3) { close(); return; }
    const key = query.toLocaleLowerCase('es');
    if (placeCache.has(key)) { render(placeCache.get(key)); return; }
    controller?.abort(); controller = new AbortController();
    box.innerHTML = '<p class="place-loading"><i></i> Buscando lugares en Perú…</p>'; box.classList.add('open');
    try {
      const params = new URLSearchParams({q:query,format:'jsonv2',countrycodes:'pe',limit:'6',addressdetails:'1','accept-language':'es'});
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`,{signal:controller.signal,headers:{Accept:'application/json'}});
      if (!response.ok) throw new Error('search');
      const results = await response.json(); placeCache.set(key,results); render(results);
    } catch (error) {
      if (error.name !== 'AbortError') box.innerHTML = '<p class="place-empty">No se pudo consultar ahora. Puedes escribir el lugar manualmente.</p>';
    }
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer=setTimeout(search,700); });
  input.addEventListener('focus', () => { if (input.value.trim().length >= 3) search(); });
  input.addEventListener('keydown', event => {
    const options=[...box.querySelectorAll('button')]; if (!options.length) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); active=(active+1)%options.length; }
    else if (event.key === 'ArrowUp') { event.preventDefault(); active=(active-1+options.length)%options.length; }
    else if (event.key === 'Enter' && active >= 0) { event.preventDefault(); choose(options[active]); return; }
    else if (event.key === 'Escape') { close(); return; } else return;
    options.forEach((item,index) => item.classList.toggle('active',index===active));
  });
document.addEventListener('click', event => { if (!input.parentElement.contains(event.target)) close(); });
});

// Asistente flotante de WhatsApp compacto (Paso a paso)
(() => {
  const widget = document.createElement('aside');
  widget.className = 'whatsapp-widget';
  widget.innerHTML = `
    <div class="whatsapp-panel whatsapp-compact-card" id="whatsapp-panel" aria-hidden="true">
      <button class="whatsapp-close" type="button" aria-label="Cerrar">×</button>
      <div class="whatsapp-panel-head">
        <span class="whatsapp-avatar"><img src="/assets/whatsapp.svg" alt="WhatsApp"></span>
        <div class="whatsapp-head-brand">
          <img class="whatsapp-head-logo" src="/assets/logo-huancas-blanco.png" alt="Transp. Huancas">
          <div class="wa-step-dots" id="wa-step-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
      <div class="wa-step-container" id="wa-step-container"></div>
      <div class="wa-card-footer-direct">
        <a href="https://wa.me/51918174705" target="_blank" rel="noopener">O escribir directo a WhatsApp sin preguntas ↗</a>
      </div>
    </div>
    <button class="whatsapp-fab" type="button" aria-expanded="false" aria-controls="whatsapp-panel" aria-label="Consultar por WhatsApp">
      <img src="/assets/whatsapp.svg" alt=""><span class="wa-fab-label" aria-hidden="true"><span class="wa-fab-text">¿Necesitas ayuda?</span><span class="wa-fab-caret"></span></span>
    </button>`;
  document.body.appendChild(widget);

  const panel = widget.querySelector('.whatsapp-panel');
  const trigger = widget.querySelector('.whatsapp-fab');
  const close = widget.querySelector('.whatsapp-close');
  const container = widget.querySelector('#wa-step-container');
  const fabText = widget.querySelector('.wa-fab-text');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prompts = ['¿Necesitas ayuda?', '¿Viajas a Piura?', '¿Vamos a Chiclayo?', '¿Rumbo a Huarmaca?', 'Cotiza tu viaje aquí'];
  let promptIndex = 0;
  let animationTimer;
  let animationPaused = false;
  const stopPrompt = () => {
    clearTimeout(animationTimer);
    widget.classList.remove('wa-is-typing');
    fabText.textContent = prompts[promptIndex];
  };
  const animatePrompt = () => {
    stopPrompt();
    if (reducedMotion.matches || document.hidden || animationPaused || widget.classList.contains('open')) return;
    animationTimer = setTimeout(() => {
      promptIndex = (promptIndex + 1) % prompts.length;
      const message = Array.from(prompts[promptIndex]);
      let position = 0;
      widget.classList.add('wa-is-typing');
      fabText.textContent = '';
      const typeNext = () => {
        fabText.textContent = message.slice(0, ++position).join('');
        if (position < message.length) animationTimer = setTimeout(typeNext, 65);
        else animatePrompt();
      };
      typeNext();
    }, 4200);
  };
  trigger.addEventListener('pointerenter', () => { animationPaused = true; stopPrompt(); });
  trigger.addEventListener('pointerleave', () => { animationPaused = false; animatePrompt(); });
  trigger.addEventListener('focus', stopPrompt);
  trigger.addEventListener('blur', animatePrompt);
  document.addEventListener('visibilitychange', animatePrompt);
  reducedMotion.addEventListener('change', animatePrompt);
  animatePrompt();

  const state = {
    step: 0,
    origen: '',
    destino: '',
    fecha: '',
    pasajeros: ''
  };

  const steps = [
    {
      key: 'origen',
      icon: '📍',
      title: '¿Desde qué ciudad o lugar sales?',
      chips: ['Huarmaca', 'Piura', 'Chiclayo', 'Olmos', 'Hualapampa', 'Jaén'],
      placeholder: 'Escribe tu lugar de recojo...'
    },
    {
      key: 'destino',
      icon: '🏁',
      title: '¿Cuál es tu destino de viaje?',
      chips: ['Huarmaca', 'Piura', 'Chiclayo', 'Olmos', 'Hualapampa', 'Jaén'],
      placeholder: 'Escribe tu destino...'
    },
    {
      key: 'fecha',
      icon: '📅',
      title: '¿Para qué fecha viajas?',
      chips: ['Hoy', 'Mañana', 'Fin de semana'],
      placeholder: 'Ej. 25 de Octubre o fecha...'
    },
    {
      key: 'pasajeros',
      icon: '👥',
      title: '¿Cuántos pasajeros viajarán?',
      chips: ['1 a 2', '3 a 5', 'Van (6 a 15)', 'Grupo (+15)'],
      placeholder: 'Número de personas...'
    }
  ];

  const handleAnswer = (val) => {
    val = (val || '').trim();
    if (!val) return;

    const current = steps[state.step];
    if (current) {
      state[current.key] = val;
    }
    state.step++;
    renderStep();
  };

  const renderStep = () => {
    // Actualizar puntos de progreso
    const dots = widget.querySelectorAll('#wa-step-dots .dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === state.step);
      dot.classList.toggle('done', idx < state.step);
    });

    if (state.step >= steps.length) {
      // Pantalla final con resumen y botón directo
      const lines = [
        'Hola Transportes Huancas, deseo cotizar un viaje:',
        `• Origen: ${state.origen}`,
        `• Destino: ${state.destino}`,
        `• Fecha: ${state.fecha}`,
        `• Pasajeros: ${state.pasajeros}`,
        '',
        '¿Podrían confirmarme disponibilidad y costo? Muchas gracias.'
      ];
      const waUrl = `https://wa.me/51918174705?text=${encodeURIComponent(lines.join('\n'))}`;

      container.innerHTML = `
        <div class="wa-step-card final-step">
          <div class="wa-step-title">
            <span>✅</span>
            <p>¡Listo! Datos de tu viaje:</p>
          </div>
          <div class="wa-compact-summary">
            <div><strong>📍</strong> <span>${state.origen}</span> ➔ <strong>🏁</strong> <span>${state.destino}</span></div>
            <div><strong>📅</strong> <span>${state.fecha}</span> · <strong>👥</strong> <span>${state.pasajeros}</span></div>
          </div>
          <a class="wa-final-btn" href="${waUrl}" target="_blank" rel="noopener">
            <span>Abrir en WhatsApp</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </a>
          <div class="wa-nav-row">
            <button type="button" class="wa-nav-btn" id="wa-restart-btn">↺ Modificar datos</button>
          </div>
        </div>
      `;

      container.querySelector('#wa-restart-btn')?.addEventListener('click', () => {
        state.step = 0;
        state.origen = '';
        state.destino = '';
        state.fecha = '';
        state.pasajeros = '';
        renderStep();
      });
      return;
    }

    const s = steps[state.step];
    const backBtnHtml = state.step > 0 ? `<button type="button" class="wa-nav-btn" id="wa-back-btn">← Volver</button>` : '';

    container.innerHTML = `
      <div class="wa-step-card">
        <div class="wa-step-title">
          <span>${s.icon}</span>
          <p>${s.title}</p>
        </div>
        <div class="wa-chips">
          ${s.chips.map(chip => `<button type="button" class="wa-chip" data-val="${chip}">${chip}</button>`).join('')}
        </div>
        <form class="wa-step-form" id="wa-step-form">
          <input class="wa-step-input" id="wa-step-input" type="text" placeholder="${s.placeholder}" autocomplete="off">
          <button class="wa-step-send" type="submit" aria-label="Continuar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </form>
        <div class="wa-nav-row">
          ${backBtnHtml}
          <span class="wa-step-count">Paso ${state.step + 1} de ${steps.length}</span>
        </div>
      </div>
    `;

    const inputEl = container.querySelector('#wa-step-input');
    setTimeout(() => inputEl?.focus(), 140);

    container.querySelectorAll('.wa-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        handleAnswer(btn.dataset.val);
      });
    });

    container.querySelector('#wa-step-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (inputEl.value.trim()) {
        handleAnswer(inputEl.value.trim());
      }
    });

    container.querySelector('#wa-back-btn')?.addEventListener('click', () => {
      if (state.step > 0) {
        state.step--;
        renderStep();
      }
    });
  };

  let initialized = false;
  const setOpen = open => {
    widget.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    animatePrompt();
    if (open) {
      if (!initialized) {
        initialized = true;
        renderStep();
      } else {
        setTimeout(() => container.querySelector('#wa-step-input')?.focus(), 200);
      }
    }
  };

  trigger.addEventListener('click', () => setOpen(!widget.classList.contains('open')));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
})();
