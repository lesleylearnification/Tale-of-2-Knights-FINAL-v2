
const game = document.getElementById('game');

const questions = [
  'I make expectations and the path forward visible before asking someone to work independently.',
  'I provide enough guidance for success without taking ownership away from the learner.',
  'I treat uncertainty as information about what support is missing, not as failure.',
  'I adjust my level of guidance to the learner’s experience and the demands of the task.',
  'I create opportunities for learners to practice, reflect, and try again.'
];

const defaultState = {
  screen: 'pretest',
  location: 'Training Yard',
  choice: '',
  reflection1: '',
  reflection2: '',
  reflection3: '',
  reflection4: '',
  pretest: [0,0,0,0,0],
  posttest: [0,0,0,0,0]
};

const saved = JSON.parse(localStorage.getItem('twoKnightsV4') || 'null');
const state = saved ? {...defaultState, ...saved} : {...defaultState};

const screens = {
  test: { image: 'locations.webp', width: 730, height: 500 },
  locations: { image: 'locations.webp', width: 730, height: 500 },
  scene: { image: 'scene.webp', width: 806, height: 500 },
  journal: { image: 'journal.webp', width: 682, height: 297 },
  chronicle: { image: 'chronicle.webp', width: 623, height: 297 },
  memory: { image: 'memory.webp', width: 623, height: 227 }
};

function save(){
  localStorage.setItem('twoKnightsV4', JSON.stringify(state));
}

function escapeHtml(value){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}

function stage(screenName, content=''){
  const screen = screens[screenName];
  return `
    <section class="stage screen-transition"
      style="--stage-w:${screen.width}px;--ratio:${screen.width}/${screen.height}">
      <img src="assets/${screen.image}" alt="">
      ${content}
    </section>`;
}

function hotspot(action,left,top,width,height,label,selected=false,value=''){
  return `
    <button type="button"
      class="hotspot ${selected?'selected':''}"
      data-action="${action}"
      data-value="${escapeHtml(value)}"
      style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"
      aria-label="${escapeHtml(label)}"></button>`;
}

function renderTest(mode){
  const values = mode === 'pre' ? state.pretest : state.posttest;
  const rows = questions.map((question,index)=>`
    <div class="test-row">
      <p>${question}</p>
      <div class="scale" role="radiogroup" aria-label="${escapeHtml(question)}">
        ${[1,2,3,4,5].map(value=>`
          <label>
            <input type="radio"
              name="${mode}-${index}"
              data-test-mode="${mode}"
              data-test-index="${index}"
              value="${value}"
              ${values[index]===value?'checked':''}>
            ${value}
          </label>`).join('')}
      </div>
    </div>`).join('');

  const heading = mode === 'pre' ? 'The Then Test' : 'The Then Test, Revisited';
  const subtitle = mode === 'pre'
    ? 'Before the trial, rate what you would do now.'
    : 'After the trial, rate what you would do now.';

  game.innerHTML = stage('test',`
    <div class="test-shell">
      <header>
        <h1>${heading}</h1>
        <p class="subtitle">${subtitle}</p>
      </header>
      <div class="test-questions">${rows}</div>
      <footer class="test-footer">
        <p class="scale-key">1 = Not yet &nbsp; • &nbsp; 5 = Consistently</p>
        <button class="art-button" type="button" data-action="${mode==='pre'?'finish-pretest':'finish-posttest'}">
          ${mode==='pre'?'Enter Camelot →':'Compare My Results →'}
        </button>
      </footer>
    </div>`);
}

function renderLocations(){
  const cards = [
    [5.8,36,27.7,21,'Library'],
    [35,36,28,21,'Training Yard'],
    [65,36,29,21,'Stables'],
    [5.8,60,27.7,21,'The Garden'],
    [35,60,28,21,'The Forge'],
    [65,60,29,21,'The Chapel']
  ];

  let content = cards.map(([left,top,width,height,name])=>
    hotspot('select-location',left,top,width,height,`Choose ${name}`,state.location===name,name)
  ).join('');

  content += hotspot('continue-locations',79,85,17,12,'Continue to the Training Yard');
  game.innerHTML = stage('locations',content);
}

function renderScene(){
  const options = [
    [5.6,72.3,56.5,7.5,'guide','Choose: Step in and offer guidance'],
    [5.6,79.2,56.5,7.5,'wait','Choose: Watch and wait'],
    [5.6,86.1,56.5,7.5,'dismiss','Choose: Tell Cedric he should already know this']
  ];

  let content = options.map(([left,top,width,height,value,label])=>
    hotspot('select-choice',left,top,width,height,label,state.choice===value,value)
  ).join('');

  content += hotspot('back-locations',2,91,15,9,'Back to Camelot');
  content += hotspot('continue-scene',84,91,14,9,'Continue to journal');

  if(state.choice){
    const feedback = {
      guide:'Your choice creates direction. Cedric receives enough guidance to act without losing ownership.',
      wait:'Waiting can preserve ownership, but only when expectations and the path are already clear.',
      dismiss:'This treats uncertainty as failure. A mentor should diagnose what is missing and make the path visible.'
    }[state.choice];
    content += `<div class="feedback" aria-live="polite">${feedback}</div>`;
  }

  game.innerHTML = stage('scene',content);
}

function renderJournal(){
  game.innerHTML = stage('journal',`
    <label class="sr-only" for="r1">What happened in this trial?</label>
    <textarea id="r1" class="journal-input" data-reflection="reflection1"
      style="left:11%;top:29%;width:36%;height:20%"
      placeholder="What happened in this trial?">${escapeHtml(state.reflection1)}</textarea>

    <label class="sr-only" for="r2">What will you do differently next time?</label>
    <textarea id="r2" class="journal-input" data-reflection="reflection2"
      style="left:51%;top:29%;width:35%;height:20%"
      placeholder="What will you do differently next time?">${escapeHtml(state.reflection2)}</textarea>

    <label class="sr-only" for="r3">What did Cedric need most?</label>
    <textarea id="r3" class="journal-input" data-reflection="reflection3"
      style="left:11%;top:57%;width:36%;height:18%"
      placeholder="What did Cedric need most?">${escapeHtml(state.reflection3)}</textarea>

    <label class="sr-only" for="r4">Insight earned</label>
    <textarea id="r4" class="journal-input" data-reflection="reflection4"
      style="left:51%;top:57%;width:35%;height:18%"
      placeholder="Insight earned">${escapeHtml(state.reflection4)}</textarea>

    ${hotspot('back-scene',1,88,16,11,'Back to the Training Yard')}
    ${hotspot('continue-journal',84,88,15,11,'Continue to the Chronicle')}
  `);
}

function renderChronicle(){
  game.innerHTML = stage('chronicle',`
    ${hotspot('back-journal',1,88,16,11,'Back to journal')}
    ${hotspot('continue-chronicle',83,88,16,11,'Continue to the Then Test')}
  `);
}

function renderResults(){
  const rows = questions.map((question,index)=>{
    const before = state.pretest[index];
    const after = state.posttest[index];
    const gain = after-before;
    return `
      <div>${question}</div>
      <strong>${before}</strong>
      <strong>${after}</strong>
      <div class="gain">${gain>0?'+'+gain:gain}</div>`;
  }).join('');

  game.innerHTML = stage('test',`
    <div class="results">
      <h1>The Chronicle of Change</h1>
      <h2>Your Then Test Results</h2>
      <div class="result-grid">
        <strong>Mentoring Behavior</strong><strong>Before</strong><strong>After</strong><strong>Change</strong>
        ${rows}
      </div>
      <div class="result-actions">
        <button class="art-button" type="button" data-action="continue-results">Add This Page to My Memory Book →</button>
      </div>
    </div>`);
}

function renderMemory(){
  const totalBefore = state.pretest.reduce((a,b)=>a+b,0);
  const totalAfter = state.posttest.reduce((a,b)=>a+b,0);
  const gain = totalAfter-totalBefore;
  game.innerHTML = stage('memory',`
    <div class="memory-note">
      <strong>What changed:</strong><br>
      Your Then Test score moved from ${totalBefore} to ${totalAfter}
      (${gain>=0?'+':''}${gain}).<br><br>
      <strong>Lesson remembered:</strong><br>
      Make the path visible while preserving the learner’s ownership.
    </div>
    ${hotspot('back-results',1,86,16,13,'Back to results')}
    ${hotspot('restart',74,85,24,14,'Return to Camelot')}
  `);
}

function allAnswered(values){
  return values.every(value=>value>=1 && value<=5);
}

function render(){
  ({
    pretest:()=>renderTest('pre'),
    locations:renderLocations,
    scene:renderScene,
    journal:renderJournal,
    chronicle:renderChronicle,
    posttest:()=>renderTest('post'),
    results:renderResults,
    memory:renderMemory
  })[state.screen]();
}

game.addEventListener('change',event=>{
  const input = event.target.closest('[data-test-mode]');
  if(!input) return;
  const key = input.dataset.testMode === 'pre' ? 'pretest' : 'posttest';
  state[key][Number(input.dataset.testIndex)] = Number(input.value);
  save();
});

game.addEventListener('input',event=>{
  const key = event.target.dataset.reflection;
  if(key && Object.prototype.hasOwnProperty.call(state,key)){
    state[key] = event.target.value;
    save();
  }
});

game.addEventListener('click',event=>{
  const target = event.target.closest('[data-action]');
  if(!target) return;

  const action = target.dataset.action;
  const value = target.dataset.value;

  switch(action){
    case 'finish-pretest':
      if(!allAnswered(state.pretest)){
        alert('Please answer all five Then Test questions.');
        return;
      }
      state.screen='locations';
      break;
    case 'select-location':
      state.location=value;
      break;
    case 'continue-locations':
      state.location=state.location||'Training Yard';
      state.screen='scene';
      break;
    case 'back-locations':
      state.screen='locations';
      break;
    case 'select-choice':
      state.choice=value;
      break;
    case 'continue-scene':
      if(!state.choice){
        alert('Choose a response first.');
        return;
      }
      state.screen='journal';
      break;
    case 'back-scene':
      state.screen='scene';
      break;
    case 'continue-journal':
      state.screen='chronicle';
      break;
    case 'back-journal':
      state.screen='journal';
      break;
    case 'continue-chronicle':
      state.screen='posttest';
      break;
    case 'finish-posttest':
      if(!allAnswered(state.posttest)){
        alert('Please answer all five Then Test questions.');
        return;
      }
      state.screen='results';
      break;
    case 'continue-results':
      state.screen='memory';
      break;
    case 'back-results':
      state.screen='results';
      break;
    case 'restart':
      Object.assign(state,{
        screen:'pretest',
        location:'Training Yard',
        choice:'',
        reflection1:'',
        reflection2:'',
        reflection3:'',
        reflection4:'',
        pretest:[0,0,0,0,0],
        posttest:[0,0,0,0,0]
      });
      break;
  }

  save();
  render();
});

render();
