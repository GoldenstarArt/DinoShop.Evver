// Brawl Swipe — swipe-to-recruit brawlers, Tinder style.
(function () {
	'use strict';

	const RARITY = {
		RARE: '#2fd16a',
		'SUPER RARE': '#2f8bff',
		EPIC: '#b24bff',
		MYTHIC: '#ff3d5a',
		LEGENDARY: '#ffd31a'
	};

	const BRAWLERS = [
		{ name: 'Rex Rumble', age: 7, emoji: '🦖', rarity: 'LEGENDARY', role: 'Tank', bg: ['#ff9b3d', '#d9480f'],
			bio: 'Hand-carved from driftwood. Loves long stomps on the beach and headbutting walls.', hp: 95, dmg: 70, spd: 40, superName: 'Fossil Quake' },
		{ name: 'Shelly Sprinkle', age: 19, emoji: '🐚', rarity: 'RARE', role: 'Support', bg: ['#ff8fc8', '#c2185b'],
			bio: 'Heals the squad with ocean vibes. Will not stop talking about tide pools.', hp: 60, dmg: 35, spd: 65, superName: 'Tidal Hug' },
		{ name: 'Blaze Kid', age: 16, emoji: '🔥', rarity: 'EPIC', role: 'Damage Dealer', bg: ['#ffcf3d', '#ff5a1f'],
			bio: 'Hot takes, hotter attacks. Swipe right if you can handle the heat.', hp: 45, dmg: 92, spd: 75, superName: 'Inferno Dash' },
		{ name: 'Captain Kraken', age: 41, emoji: '🐙', rarity: 'MYTHIC', role: 'Controller', bg: ['#6be0ff', '#1666d6'],
			bio: 'Eight arms, eight hugs. Traps enemies in ink and refuses to apologize.', hp: 70, dmg: 60, spd: 45, superName: 'Ink Prison' },
		{ name: 'Robo Ruckus', age: 3, emoji: '🤖', rarity: 'SUPER RARE', role: 'Marksman', bg: ['#b8c4ff', '#4b5bd6'],
			bio: 'Precision-engineered sniper. Beep boop means "I like you".', hp: 50, dmg: 85, spd: 50, superName: 'Laser Grid' },
		{ name: 'Mystic Moth', age: 222, emoji: '🦋', rarity: 'EPIC', role: 'Assassin', bg: ['#d58bff', '#6a1fd1'],
			bio: 'Appears at night near street lamps. Gone before you can say "rematch".', hp: 40, dmg: 80, spd: 95, superName: 'Dust Veil' },
		{ name: 'Cactus Joe', age: 33, emoji: '🌵', rarity: 'RARE', role: 'Thrower', bg: ['#a6ff7a', '#2f9e3c'],
			bio: 'Prickly outside, soft inside. Lobs spike bombs over walls.', hp: 65, dmg: 72, spd: 35, superName: 'Needle Rain' },
		{ name: 'Frost Bite', age: 12, emoji: '🐧', rarity: 'SUPER RARE', role: 'Controller', bg: ['#e0f7ff', '#5fb7e8'],
			bio: 'Cool under pressure. Literally. Slides into battle belly-first.', hp: 55, dmg: 50, spd: 80, superName: 'Blizzard Belly' },
		{ name: 'Bonk Gorilla', age: 28, emoji: '🦍', rarity: 'MYTHIC', role: 'Tank', bg: ['#c9a27a', '#6b4425'],
			bio: 'Gym every day. Bench presses the safe in Heist mode.', hp: 100, dmg: 65, spd: 55, superName: 'Ground Pound' },
		{ name: 'Glitch Ghost', age: 404, emoji: '👻', rarity: 'LEGENDARY', role: 'Assassin', bg: ['#9ef6ff', '#7d5cff'],
			bio: 'Phases through walls and your expectations. Boo.', hp: 35, dmg: 88, spd: 90, superName: 'Ectoplasm Blink' },
		{ name: 'Sir Shroom', age: 61, emoji: '🍄', rarity: 'RARE', role: 'Support', bg: ['#ff6b6b', '#a3172a'],
			bio: 'Spore clouds that heal friends and confuse foes. Very fungi to be around.', hp: 62, dmg: 40, spd: 45, superName: 'Spore Party' },
		{ name: 'Thunder Tiger', age: 24, emoji: '🐯', rarity: 'EPIC', role: 'Damage Dealer', bg: ['#ffd54a', '#e07b00'],
			bio: 'Stripes earned, not bought. Roars in all caps.', hp: 68, dmg: 82, spd: 72, superName: 'Storm Pounce' }
	];

	const OPPONENTS = ['💀', '🧟', '👹', '🦂', '🐉', '🤡', '🦈'];
	const MATCH_LINES = [
		'{n} wants to team up for Gem Grab!',
		'{n} already picked the drop spot. Ready?',
		'{n} says: "Duo Showdown? You and me."',
		'{n} brought snacks for the lobby.',
		'{n} is hyped. Like, really hyped.'
	];

	const $ = (s) => document.querySelector(s);
	const deckEl = $('#deck');
	const emptyEl = $('#empty');
	const trophyEl = $('#trophyCount');
	const teamCountEl = $('#teamCount');
	const teamList = $('#teamList');

	let queue = [];
	let team = [];
	let trophies = 0;
	let busy = false;
	let lastMatch = null;

	const rand = (a, b) => a + Math.random() * (b - a);
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
	const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

	/* ---------------- Particles ---------------- */
	const canvas = $('#sparks');
	const ctx = canvas.getContext('2d');
	let particles = [];
	let rafId = null;

	function resize() {
		const dpr = window.devicePixelRatio || 1;
		canvas.width = innerWidth * dpr;
		canvas.height = innerHeight * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	addEventListener('resize', resize);
	resize();

	function burst(x, y, opts) {
		const o = Object.assign({ count: 40, colors: ['#ffd31a', '#ff3d7f', '#2fb4ff', '#34e07a', '#fff'], speed: 9, gravity: .25, shapes: ['rect', 'circle', 'star'] }, opts);
		for (let i = 0; i < o.count; i++) {
			const a = rand(0, Math.PI * 2);
			const v = rand(o.speed * .35, o.speed);
			particles.push({
				x, y,
				vx: Math.cos(a) * v,
				vy: Math.sin(a) * v - o.speed * .3,
				g: o.gravity,
				size: rand(5, 11),
				rot: rand(0, Math.PI * 2),
				vr: rand(-.3, .3),
				color: pick(o.colors),
				shape: pick(o.shapes),
				life: 1,
				decay: rand(.008, .018)
			});
		}
		if (!rafId) rafId = requestAnimationFrame(tick);
	}

	function drawStar(r) {
		ctx.beginPath();
		for (let i = 0; i < 10; i++) {
			const rr = i % 2 ? r * .45 : r;
			const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
			ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
		}
		ctx.closePath();
		ctx.fill();
	}

	function tick() {
		ctx.clearRect(0, 0, innerWidth, innerHeight);
		particles = particles.filter((p) => p.life > 0 && p.y < innerHeight + 40);
		for (const p of particles) {
			p.vy += p.g;
			p.vx *= .985;
			p.x += p.vx;
			p.y += p.vy;
			p.rot += p.vr;
			p.life -= p.decay;
			ctx.save();
			ctx.globalAlpha = Math.max(p.life, 0);
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.fillStyle = p.color;
			if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
			else if (p.shape === 'star') drawStar(p.size * .8);
			else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
			ctx.restore();
		}
		rafId = particles.length ? requestAnimationFrame(tick) : null;
		if (!rafId) ctx.clearRect(0, 0, innerWidth, innerHeight);
	}

	/* ---------------- Cards ---------------- */
	function cardHTML(b) {
		const legendary = b.rarity === 'LEGENDARY' ? ' legendary' : '';
		return `
			<div class="card-bg-rays"></div>
			<div class="rarity${legendary}" style="--rarity:${RARITY[b.rarity]}">${b.rarity}</div>
			<div class="power"><div>${b.power}<small>POWER</small></div></div>
			<div class="avatar">${b.emoji}</div>
			<div class="stamp like">RECRUIT</div>
			<div class="stamp nope">PASS</div>
			<div class="stamp super">★ SUPER! ★</div>
			<div class="info">
				<div class="name-row"><h2 class="name">${esc(b.name)}</h2><span class="age">${b.age}</span></div>
				<span class="role">${esc(b.role)}</span>
				<p class="bio">${esc(b.bio)}</p>
				<div class="stats">
					<div class="stat">HEALTH<div class="bar"><i style="--v:${b.hp}%;--c:#34e07a"></i></div></div>
					<div class="stat">DAMAGE<div class="bar"><i style="--v:${b.dmg}%;--c:#ff4a3d"></i></div></div>
					<div class="stat">SPEED<div class="bar"><i style="--v:${b.spd}%;--c:#2fb4ff"></i></div></div>
				</div>
				<div class="super-tag">⚡ SUPER: ${esc(b.superName)}</div>
			</div>
			<div class="card-shine"></div>`;
	}

	function buildDeck() {
		deckEl.innerHTML = '';
		emptyEl.hidden = true;
		queue = shuffle(BRAWLERS).map((b) => Object.assign({}, b, { power: Math.ceil(rand(1, 11)) }));
		// Render only the top few cards; deeper ones get added as we swipe.
		renderStack(true);
	}

	function renderStack(dealAnim) {
		const existing = deckEl.querySelectorAll('.card');
		const needed = Math.min(3, queue.length);
		for (let i = existing.length; i < needed; i++) {
			const b = queue[i];
			const el = document.createElement('article');
			el.className = 'card' + (dealAnim ? ' enter' : '');
			el.style.setProperty('--card-bg', `linear-gradient(160deg, ${b.bg[0]}, ${b.bg[1]})`);
			if (dealAnim) el.style.animationDelay = (needed - 1 - i) * 90 + 'ms';
			el.innerHTML = cardHTML(b);
			el._brawler = b;
			deckEl.prepend(el); // newest goes underneath
		}
		layoutStack();
		if (!queue.length) emptyEl.hidden = false;
	}

	function layoutStack() {
		const cards = [...deckEl.querySelectorAll('.card')].reverse(); // top first
		cards.forEach((c, i) => {
			c.classList.toggle('top', i === 0);
			c.classList.toggle('behind', i > 0);
			c.style.zIndex = 10 - i;
			c.style.transform = `translateY(${i * 14}px) scale(${1 - i * .05})`;
		});
		if (cards[0]) attachDrag(cards[0]);
	}

	/* ---------------- Drag physics ---------------- */
	function attachDrag(card) {
		if (card._drag) return;
		card._drag = true;
		let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, lastX = 0, lastT = 0, vx = 0;
		const stampLike = card.querySelector('.stamp.like');
		const stampNope = card.querySelector('.stamp.nope');
		const stampSuper = card.querySelector('.stamp.super');
		const shine = card.querySelector('.card-shine');

		card.addEventListener('pointerdown', (e) => {
			if (busy) return;
			dragging = true;
			card.setPointerCapture(e.pointerId);
			card.classList.add('dragging');
			card.classList.remove('enter');
			startX = e.clientX; startY = e.clientY;
			lastX = e.clientX; lastT = performance.now();
			dx = dy = vx = 0;
		});

		card.addEventListener('pointermove', (e) => {
			const r = card.getBoundingClientRect();
			shine.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
			shine.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
			if (!dragging) {
				// Gentle 3D tilt on hover (mouse only).
				if (e.pointerType === 'mouse' && !busy) {
					const tx = ((e.clientX - r.left) / r.width - .5) * 10;
					const ty = ((e.clientY - r.top) / r.height - .5) * -10;
					card.style.transform = `perspective(900px) rotateY(${tx}deg) rotateX(${ty}deg)`;
				}
				return;
			}
			dx = e.clientX - startX;
			dy = e.clientY - startY;
			const now = performance.now();
			vx = (e.clientX - lastX) / Math.max(now - lastT, 1);
			lastX = e.clientX; lastT = now;
			card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`;
			const p = Math.min(Math.abs(dx) / 110, 1);
			stampLike.style.opacity = dx > 0 ? p : 0;
			stampNope.style.opacity = dx < 0 ? p : 0;
			stampSuper.style.opacity = dy < -40 && Math.abs(dx) < 80 ? Math.min(-dy / 140, 1) : 0;
			stampLike.style.transform = `rotate(-16deg) scale(${1 + p * .15})`;
			stampNope.style.transform = `rotate(16deg) scale(${1 + p * .15})`;
			// Pull the next card forward as this one moves away.
			const next = card.previousElementSibling;
			if (next) {
				const k = Math.min(Math.hypot(dx, dy) / 200, 1);
				next.style.transition = 'none';
				next.style.transform = `translateY(${14 - k * 14}px) scale(${.95 + k * .05})`;
				next.style.filter = `brightness(${.7 + k * .3})`;
			}
		});

		const end = () => {
			if (!dragging) return;
			dragging = false;
			card.classList.remove('dragging');
			const next = card.previousElementSibling;
			if (next) { next.style.transition = ''; next.style.filter = ''; }
			if (dy < -140 && Math.abs(dx) < 120) return swipe('super', card);
			if (dx > 110 || vx > .7) return swipe('like', card, vx);
			if (dx < -110 || vx < -.7) return swipe('nope', card, vx);
			// Spring back.
			[stampLike, stampNope, stampSuper].forEach((s) => (s.style.opacity = 0));
			layoutStack();
		};
		card.addEventListener('pointerup', end);
		card.addEventListener('pointercancel', end);
		card.addEventListener('pointerleave', () => { if (!dragging && !busy) card.style.transform = ''; });
	}

	function swipe(dir, card, velocity) {
		card = card || deckEl.lastElementChild;
		if (!card || busy) return;
		busy = true;
		const b = card._brawler;
		const btn = { like: '#btnLike', nope: '#btnNope', super: '#btnSuper' }[dir];
		$(btn).classList.remove('pop'); void $(btn).offsetWidth; $(btn).classList.add('pop');

		card.querySelector('.stamp.' + dir).style.opacity = 1;
		const r = card.getBoundingClientRect();
		const w = innerWidth;
		let tx = 0, ty = 0, rot = 0;
		if (dir === 'like') { tx = w + r.width; ty = rand(-80, 80); rot = 30 + (velocity || 0) * 10; }
		if (dir === 'nope') { tx = -w - r.width; ty = rand(-80, 80); rot = -30 + (velocity || 0) * 10; }
		if (dir === 'super') { ty = -innerHeight - r.height; rot = rand(-10, 10); }

		card.classList.remove('dragging');
		card.style.transition = 'transform .55s cubic-bezier(.4,0,.6,1), opacity .55s';
		card.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
		card.style.opacity = dir === 'super' ? 1 : .9;

		const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
		if (dir === 'like') burst(cx + r.width / 3, cy, { count: 25, colors: ['#34e07a', '#a6ff7a', '#fff'], shapes: ['circle'] });
		if (dir === 'super') burst(cx, cy, { count: 45, colors: ['#ffd31a', '#fff19a', '#fff'], shapes: ['star'], speed: 12 });
		if (dir === 'nope') burst(cx - r.width / 3, cy, { count: 18, colors: ['#ff4a3d', '#ff8a80'], shapes: ['rect'], speed: 6 });

		setTimeout(() => {
			card.remove();
			queue.shift();
			renderStack(false);
			// Cards dealt in after a swipe slide in from below the stack.
			const fresh = deckEl.firstElementChild;
			if (fresh && queue.length >= 3) fresh.animate([{ opacity: 0, transform: 'translateY(60px) scale(.8)' }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
			busy = false;
			if (dir !== 'nope') {
				const chance = dir === 'super' ? .95 : .6;
				if (Math.random() < chance) showMatch(b, dir === 'super');
			}
		}, 380);
	}

	/* ---------------- Match ---------------- */
	function addTrophies(n) {
		const from = trophies;
		trophies = Math.max(0, trophies + n);
		const to = trophies;
		const start = performance.now();
		const step = (t) => {
			const k = Math.min((t - start) / 700, 1);
			trophyEl.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
			if (k < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
		const box = trophyEl.parentElement;
		box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
	}

	function showMatch(b, superLiked) {
		lastMatch = b;
		team.push(Object.assign({ superLiked }, b));
		teamCountEl.textContent = team.length;
		addTrophies(superLiked ? 15 : 8);

		const them = $('#matchThem');
		them.style.background = `linear-gradient(160deg, ${b.bg[0]}, ${b.bg[1]})`;
		them.innerHTML = `<div class="vs-avatar">${b.emoji}</div><b>${esc(b.name.split(' ')[0].toUpperCase())}</b>`;
		$('#matchLine').textContent = pick(MATCH_LINES).replace('{n}', b.name);

		const m = $('#match');
		// Restart CSS animations on each show.
		m.hidden = true; void m.offsetWidth; m.hidden = false;
		document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');

		const cx = innerWidth / 2, cy = innerHeight / 2;
		setTimeout(() => burst(cx, cy - 60, { count: 90, speed: 14 }), 150);
		setTimeout(() => { burst(cx * .4, cy, { count: 40 }); burst(cx * 1.6, cy, { count: 40 }); }, 550);
	}

	function hideMatch() { $('#match').hidden = true; }

	/* ---------------- Battle mini-game ---------------- */
	function runBattle(b) {
		hideMatch();
		const bt = $('#battle');
		const L = $('#fLeft'), R = $('#fRight'), res = $('#battleResult');
		const foe = pick(OPPONENTS);
		L.className = 'fighter left'; R.className = 'fighter right';
		L.innerHTML = `<span class="hp"><i></i></span><span class="face">${b.emoji}</span>`;
		R.innerHTML = `<span class="hp"><i></i></span><span class="face">${foe}</span>`;
		res.innerHTML = '';
		$('#battleBanner').textContent = pick(['SHOWDOWN!', 'BRAWL BALL!', 'GEM GRAB!', 'KNOCKOUT!']);
		bt.hidden = true; void bt.offsetWidth; bt.hidden = false;

		let hpL = 100, hpR = 100, turn = 0;
		const field = bt.querySelector('.battle-field');
		const atk = 20 + b.dmg * .25;

		function popDmg(target, n) {
			const d = document.createElement('div');
			d.className = 'dmg';
			d.textContent = '-' + n;
			d.style.left = target.offsetLeft + 20 + 'px';
			d.style.top = '20px';
			field.appendChild(d);
			setTimeout(() => d.remove(), 800);
		}
		function anim(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

		const loop = setInterval(() => {
			const leftTurn = turn++ % 2 === 0;
			const attacker = leftTurn ? L : R, target = leftTurn ? R : L;
			anim(attacker, leftTurn ? 'attack-l' : 'attack-r');
			setTimeout(() => {
				anim(target, 'hit');
				const n = Math.round(leftTurn ? rand(atk * .7, atk * 1.3) : rand(14, 30));
				if (leftTurn) hpR = Math.max(0, hpR - n); else hpL = Math.max(0, hpL - n);
				popDmg(target, n);
				L.querySelector('.hp i').style.width = hpL + '%';
				R.querySelector('.hp i').style.width = hpR + '%';
				const tr = target.getBoundingClientRect();
				burst(tr.left + tr.width / 2, tr.top + tr.height / 2, { count: 14, colors: ['#fff', '#ffd31a', '#ff4a3d'], shapes: ['circle'], speed: 7 });
				anim(field, 'shake');
				if (hpL <= 0 || hpR <= 0) {
					clearInterval(loop);
					const won = hpR <= 0;
					anim(won ? R : L, 'ko');
					setTimeout(() => endBattle(won), 700);
				}
			}, 170);
		}, 550);
	}

	function endBattle(won) {
		const res = $('#battleResult');
		res.innerHTML = `<h3 class="${won ? 'win' : 'lose'}">${won ? 'VICTORY!' : 'DEFEAT'}</h3>
			<button class="chunky ${won ? 'yellow' : 'blue'}" id="battleDone">${won ? '+20 🏆 CONTINUE' : '-5 🏆 CONTINUE'}</button>`;
		if (won) burst(innerWidth / 2, innerHeight / 2, { count: 120, speed: 15 });
		$('#battleDone').onclick = () => {
			$('#battle').hidden = true;
			addTrophies(won ? 20 : -5);
		};
	}

	/* ---------------- Team drawer ---------------- */
	function openDrawer() {
		teamList.innerHTML = team.map((b, i) => `
			<li style="--card-bg:linear-gradient(160deg, ${b.bg[0]}, ${b.bg[1]});--i:${i}">
				<span class="mini">${b.emoji}</span>
				<span><b>${esc(b.name)}</b><small>${esc(b.role)} · ${b.rarity}</small></span>
				${b.superLiked ? '<span class="star">⭐</span>' : ''}
			</li>`).join('');
		$('#teamEmpty').hidden = team.length > 0;
		$('#drawer').classList.add('open');
		$('#drawer').setAttribute('aria-hidden', 'false');
		$('#scrim').classList.add('show');
	}
	function closeDrawer() {
		$('#drawer').classList.remove('open');
		$('#drawer').setAttribute('aria-hidden', 'true');
		$('#scrim').classList.remove('show');
	}

	/* ---------------- Wiring ---------------- */
	$('#btnLike').onclick = () => swipe('like');
	$('#btnNope').onclick = () => swipe('nope');
	$('#btnSuper').onclick = () => swipe('super');
	$('#reshuffle').onclick = buildDeck;
	$('#matchKeep').onclick = hideMatch;
	$('#matchBattle').onclick = () => lastMatch && runBattle(lastMatch);
	$('#teamBtn').onclick = openDrawer;
	$('#drawerClose').onclick = closeDrawer;
	$('#scrim').onclick = closeDrawer;

	addEventListener('keydown', (e) => {
		if (!$('#match').hidden) { if (e.key === 'Escape' || e.key === 'Enter') hideMatch(); return; }
		if (!$('#battle').hidden) return;
		if (e.key === 'ArrowRight') swipe('like');
		else if (e.key === 'ArrowLeft') swipe('nope');
		else if (e.key === 'ArrowUp') { e.preventDefault(); swipe('super'); }
		else if (e.key === 'Escape') closeDrawer();
	});

	buildDeck();
})();
