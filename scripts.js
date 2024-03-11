const volume = 100;

//-----------------------------------------------------//
// Info
//-----------------------------------------------------//
const info_state = document.querySelector('#info_state');
const info_time  = document.querySelector('#info_time');
const info_set   = document.querySelector('#info_set');

//-----------------------------------------------------//
// Buttons
//-----------------------------------------------------//

const btn_start = document.querySelector('#btn_start');
const btn_stop  = document.querySelector('#btn_stop');

btn_start.addEventListener('click', ev => START_CHRONO());
btn_stop.addEventListener('click',  ev =>  STOP_CHRONO());

//-----------------------------------------------------//
// Inputs
//-----------------------------------------------------//

const input_drawTime       = document.querySelector('#drawTime');
const input_restTime       = document.querySelector('#restTime');
const input_duration       = document.querySelector('#duration');
const input_startCountdown = document.querySelector('#startCountdown');
const input_drawCountdown  = document.querySelector('#drawCountdown');
const input_restCountdown  = document.querySelector('#restCountdown');

const allInputs = [
	input_drawTime, input_restTime, input_duration,
	input_startCountdown, input_drawCountdown, input_restCountdown
];

allInputs.forEach(el => {
	el.addEventListener('keyup', ev => {
		data.update();
		data.updateGui_inputs();
		data.updateGui_info();
		console.log(data);
	});
});

//-----------------------------------------------------//
const textInput = document.getElementById('textInput');
document.addEventListener('keydown', ev => {
	if (ev.code === 'Space') START_CHRONO();
	if (ev.code === 'Escape') STOP_CHRONO();
});
//-----------------------------------------------------//

const data = {
	_states: ['get ready','draw', 'rest', 'stop'],
	running: false,

	// Fixed variables
	drawTime: 15,		// seconds
	restTime: 30,		// seconds
	sets: 13,			// amount in
	duration: 10, 	// x minutes
	startCountdown: 10,	// seconds
	drawCountdown: 5,	// seconds
	restCountdown: 3,	// seconds

	// Runtime variables
	state: 0, 			// 0-waiting, 1-draw, 2-rest, 3-stop
	elapsedTime: 0,		// seconds
	currentSet: 0,		// ammount
	interval: null,
	
	// Draw default data on screen
	init(){
		input_drawTime.placeholder = `${this.drawTime} seconds`;
		input_restTime.placeholder = `${this.restTime} seconds`;
		input_duration.placeholder = `${this.duration} minutes`;
		input_startCountdown.placeholder = `${this.startCountdown} seconds`;
		input_drawCountdown.placeholder  = `${this.drawCountdown} seconds`;
		input_restCountdown.placeholder  = `${this.restCountdown} seconds`;
	},
	
	// This function makes all the necessary calculations for the values needed
	update() {
		if (this.running) return Error('No se pueden actualizar los datos mientras está corriendo');
		// If drawTime but not restTime is set, update restTime acordly to x2 of drawTime
		if(input_drawTime.value && !input_restTime.value) {
			this.drawTime = Number(input_drawTime.value);
			this.restTime = Number(input_drawTime.value * 2);
		}
		else if (!input_drawTime.value && input_restTime.value){
			this.restTime = Number(input_restTime.value);
			this.drawTime = Math.round(Number(input_restTime.value / 2));
		}
		if(input_duration.value) this.duration = Number(input_duration.value);


		if(input_drawCountdown.value > (this.drawTime - 1)) {

		}

		if(input_startCountdown.value) this.startCountdown = Number(input_startCountdown.value);
		if(input_drawCountdown.value)  this.drawCountdown  = Number(input_drawCountdown.value);
		if(input_restCountdown.value)  this.restCountdown  = Number(input_restCountdown.value);

		// Update sets based on new draw/rest/duration time
		this.sets = Math.round((this.duration * 60) / (this.drawTime + this.restTime))
	},
	pause(){},
	stop(){
		data.running     = false;
		data.interval    = null;
		data.state       = 3;
		data.currentSet  = 0;
		data.elapsedTime = 0

		this.updateGui_info();
	},
	// This is(should) always be ran after init to update the values on screen
	updateGui_inputs(){
		if (this.running) return Error('No se pueden actualizar los datos mientras está corriendo');

		if (input_drawTime.value && !input_restTime.value) {
			input_drawTime.value       = this.drawTime;
			input_restTime.placeholder = `${this.restTime} seconds`;

		} else if (!input_drawTime.value && !!input_restTime.value){
			input_restTime.value       = this.restTime;
			input_drawTime.placeholder = `${this.drawTime} seconds`;
		} else {
			input_drawTime.placeholder = `${this.drawTime} seconds`;
			input_restTime.placeholder = `${this.restTime} seconds`;
		}

		input_duration.placeholder       = `${this.duration} minutes`;
		input_startCountdown.placeholder = `${this.startCountdown} seconds`;
		input_drawCountdown.placeholder  = `${this.drawCountdown} seconds`;
		input_restCountdown.placeholder  = `${this.restCountdown} seconds`;

	},
	updateGui_info() {
		if (this.running) return Error('No se pueden actualizar los datos mientras está corriendo');
		console.log(this.getState(), this.state);
		info_state.innerText = this.getState();
		info_time.innerText  = this.elapsedTime;
		info_set.innerText   = `${this.currentSet}/${this.sets}`
	},
	getState() {
		return this._states[this.state]
	}
}
data.init();

function START_CHRONO() {
	solicitarBloqueoPantalla();
	
	data.state = 0;
	
	data.updateGui_inputs();
	data.updateGui_info();
	data.running = true;

	if (data.interval != null) return console.warn("Interval already running!");

	if(data.state === 0) {
		data.elapsedTime = data.startCountdown;
		data.currentSet = 1;
		info_set.innerText = `${data.currentSet}/${data.sets}`;

		beep(100,600,volume);
	}

	console.log('Segundos restantes: ', data.elapsedTime);
		info_time.innerText = data.elapsedTime;


	data.interval = setInterval(() => {
		// DATA
		data.elapsedTime -= 1;
		console.log('Segundos restantes: ', data.elapsedTime);
		
		// Si es el countdown inicial, hace este beep
		if(data.state === 0 && data.elapsedTime > 0) {
			beep(100,600,volume);
		}

		// Beep de countdown para Draw/Rest
		// Si es DRAW usamos el tiempo en Rest Countdown
		if(data.state === 1 && data.elapsedTime      > 0 && data.elapsedTime < (data.restCountdown+1))  {
			beep(100,2000,volume);
		}
		// Si es REST usamos el tiempo en Draw Countdown
		else if(data.state === 2 && data.elapsedTime > 0 && data.elapsedTime < (data.drawCountdown+1))  {
			beep(100,1500,volume);
		}

		// Cuando es el último segundo, no importa de quien, hace este otro beep
		// Y según el estado y demas
		if(data.elapsedTime === 0) {
			beep(100,1000,volume);

			if(data.currentSet < data.sets) {
				// Intercambio normal de estados
				switch (data.state) {
					case 0: // Pasa a DRAW
						data.elapsedTime = data.drawTime;
						data.state = 1;
					break;
					case 1: // Pasa a REST
						data.elapsedTime = data.restTime;
						data.state = 2;
					break;
					case 2: // Pasa a DRAW
						data.elapsedTime = data.drawTime;
						data.state = 1;
						data.currentSet += 1;
					break;
				}
			}
			// Estado al finalizar los sets indicados
			if(data.currentSet === data.sets) {
				data.elapsedTime = data.startCountdown;
				data.elapsedTime = data.startCountdown;
				data.state = 0;
				STOP_CHRONO();
				VICTORY_SONG();
			}

		}

		// GUI
		info_state.innerText = data.getState();
		info_time.innerText = data.elapsedTime; // Lo escribe en pantalla
		info_set.innerText = `${data.currentSet}/${data.sets}`;
	}, 1000);
}

function STOP_CHRONO() {
	console.clear()
	clearInterval(data.interval);
	data.stop()
}

function VICTORY_SONG() {
	let count = 0;
	let interval = setInterval(() => {
		switch (count) {
			case 0: beep(100,800,volume); break;
			case 1: beep(100,800,volume); break;
			case 2: beep(200,600,volume); break;
			case 4: beep(100,800,volume); break;
			case 6: beep(200,600,volume); break;
			case 7: beep(100,1000,volume); break;
			case 8: clearInterval(interval)
		}
		count +=1
	}, 220);
}


//-----------------------------------------------------//
// Wake Lock
let wakelockObj = null;
async function solicitarBloqueoPantalla() {
	try {
		wakelockObj = await navigator.wakeLock.request('screen')
		console.log('Pantalla bloqueda');
		console.log(wakelockObj);
	} catch (error) {
		console.error('Error de bloqueo: ' + error);
	}
}
//-----------------------------------------------------//