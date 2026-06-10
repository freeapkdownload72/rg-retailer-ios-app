/* Onboarding & Auth storyboard */
(function(){
  const W=WF, board=document.getElementById('board-onboarding');
  const {ic,lns,img,chips,phone,note}=W;

  // Splash
  const splash = phone(`<div class="pad col center" style="justify-content:center;height:100%;gap:14px">
    <div class="logo" style="font-size:34px"><span class="mark" style="width:54px;height:54px;font-size:30px">RG</span></div>
    <div class="tt" style="font-size:20px">RG Retailer</div>
    <div class="sm" style="text-align:center">fashion that gets you.</div>
    <div style="height:30px"></div>
    <div class="btn pri full">Get started</div>
    <div class="sm">I already have an account</div>
  </div>`);

  // Auth choice
  const auth = phone(`<div class="pad col gap12" style="padding:18px 16px">
    <div class="tt" style="font-size:19px">Create your account</div>
    <div class="sm">Sign up in seconds — we'll personalize from here.</div>
    <div style="height:6px"></div>
    <div class="sm">Mobile number</div>
    <div class="row2" style="border:1.6px solid var(--line);border-radius:11px;padding:10px 12px;gap:8px">
      <span class="tt" style="font-size:13px">🇮🇳 +91</span><div class="ln t" style="width:60%;margin:0"></div></div>
    <div class="btn pri full">Send OTP ${ic('fwd')}</div>
    <div class="row2 center gap8" style="margin:6px 0"><div class="ln" style="flex:1"></div><span class="xs">or</span><div class="ln" style="flex:1"></div></div>
    <div class="btn full">${ic('user')} &nbsp;Continue with Google</div>
    <div class="btn full">${ic('user')} &nbsp;Continue with Apple</div>
    <div class="xs" style="text-align:center;margin-top:8px">By continuing you agree to Terms & Privacy</div>
  </div>`);

  // OTP
  const otp = phone(`<div class="pad col gap10" style="padding:18px 16px">
    <div class="iconbtn">${ic('back')}</div>
    <div class="tt" style="font-size:19px;margin-top:6px">Verify your number</div>
    <div class="sm">Enter the 6-digit code sent to<br><b>+91 98765 43210</b></div>
    <div class="row2 gap6" style="margin:14px 0">
      ${[1,2,3,4,5,6].map(n=>`<div style="flex:1;height:42px;border:1.8px solid var(--line);border-radius:9px;display:grid;place-items:center" class="tt">${n<3?n:''}</div>`).join('')}
    </div>
    <div class="sm">Resend code in 0:24</div>
    <div style="flex:1"></div>
    <div class="btn pri full">Verify ${ic('check')}</div>
  </div>`);

  // Gender
  const gender = phone(`<div class="pad col gap10" style="padding:18px 16px">
    <div class="xs">Step 1 of 4</div>
    <div style="height:5px;background:var(--fill);border-radius:6px"><div style="width:25%;height:100%;background:var(--accent);border-radius:6px"></div></div>
    <div class="tt" style="font-size:20px;margin-top:8px">Who are we styling?</div>
    <div class="sm">We tune your feed & sizing to this.</div>
    <div class="col gap8" style="margin-top:10px">
      ${['Women','Men','Both / everything'].map((g,i)=>`<div class="btn full ${i===0?'pri':''}" style="text-align:left;padding:14px 14px">${g}</div>`).join('')}
    </div>
    <div style="flex:1"></div>
    <div class="btn pri full">Next ${ic('fwd')}</div>
  </div>`);

  // Age
  const age = phone(`<div class="pad col gap10" style="padding:18px 16px">
    <div class="xs">Step 2 of 4</div>
    <div style="height:5px;background:var(--fill);border-radius:6px"><div style="width:50%;height:100%;background:var(--accent);border-radius:6px"></div></div>
    <div class="tt" style="font-size:20px;margin-top:8px">Your age range</div>
    <div class="sm">Helps us match fits & trends.</div>
    <div class="row2 wrap gap8" style="margin-top:12px">
      ${['Under 18','18–24','25–34','35–44','45–54','55+'].map((a,i)=>`<div class="chip ${i===1?'on':''}" style="padding:11px 16px;font-size:14px">${a}</div>`).join('')}
    </div>
    <div style="flex:1"></div>
    <div class="btn pri full">Next ${ic('fwd')}</div>
  </div>`);

  // Profession
  const prof = phone(`<div class="pad col gap10" style="padding:18px 16px">
    <div class="xs">Step 3 of 4</div>
    <div style="height:5px;background:var(--fill);border-radius:6px"><div style="width:75%;height:100%;background:var(--accent);border-radius:6px"></div></div>
    <div class="tt" style="font-size:20px;margin-top:8px">What do you do?</div>
    <div class="sm">We'll surface workwear, casual or campus looks.</div>
    <div class="row2 wrap gap8" style="margin-top:12px">
      ${['Student','Corporate','Creative','Healthcare','Business owner','Tech','Fitness','Other'].map((a,i)=>`<div class="chip ${i===2?'on':''}" style="padding:10px 14px">${a}</div>`).join('')}
    </div>
    <div style="flex:1"></div>
    <div class="btn pri full">Next ${ic('fwd')}</div>
  </div>`);

  // Taste quiz — swipe outfits
  const taste = phone(`<div class="pad col gap8" style="padding:16px 14px;height:100%">
    <div class="xs">Step 4 of 4 · Style quiz</div>
    <div class="row2 between center"><div class="tt" style="font-size:18px">Your taste</div><span class="xs">7 / 12</span></div>
    <div class="sm">Swipe right on looks you love.</div>
    <div style="position:relative;flex:1;margin:8px 0">
      <div style="position:absolute;inset:8px 18px 0 -4px;transform:rotate(4deg)">${img(300,'')}</div>
      <div style="position:absolute;inset:0 0 8px 6px">${img(310,'outfit look')}</div>
    </div>
    <div class="row2 between" style="padding:0 20px">
      <div class="iconbtn" style="width:46px;height:46px;border-radius:50%">✕</div>
      <div class="iconbtn" style="width:46px;height:46px;border-radius:50%;background:var(--accent);color:#fff;border-color:var(--line)">${ic('heart')}</div>
    </div>
  </div>`);

  // Building feed
  const building = phone(`<div class="pad col center" style="justify-content:center;height:100%;gap:16px;text-align:center">
    <div style="width:64px;height:64px;border:2.5px solid var(--line);border-radius:50%;display:grid;place-items:center;color:var(--accent)">${ic('sparkle','ic')}</div>
    <div class="tt" style="font-size:20px">Building your feed…</div>
    <div class="sm">Matching 2,400+ pieces to your style,<br>size & profession.</div>
    <div style="width:70%;height:6px;background:var(--fill);border-radius:6px"><div style="width:68%;height:100%;background:var(--accent);border-radius:6px"></div></div>
    <div class="xs">Curating Women · 18–24 · Creative</div>
  </div>`);

  // Membership intro
  const memberIntro = phone(`<div class="pad col gap10" style="padding:18px 14px">
    <div class="tt" style="font-size:19px">Pick your membership</div>
    <div class="sm">Start free — upgrade anytime.</div>
    ${['Free','Plus','VIP'].map((t,i)=>`<div class="btn full ${i===2?'pri':''}" style="text-align:left;padding:12px">
      <div class="row2 between center"><span class="tt">RG ${t}</span><span class="sm">${['₹0','₹199/mo','₹499/mo'][i]}</span></div>
      <div class="xs" style="margin-top:3px">${['Browse + 1 try-on/day','Unlimited try-on + free ship','Stylist + early drops + extra %'][i]}</div></div>`).join('')}
    <div class="btn full">Maybe later — continue free</div>
  </div>`);

  board.innerHTML = `
    <div class="board-head"><h2>Onboarding &amp; Auth</h2><p>From first launch to a personalized feed — phone/OTP or social login, then a 4-step taste profile that feeds the recommendation engine.</p></div>
    <div class="flowlabel">The signup journey</div>
    <p class="flowsub">One continuous flow · drop-off kept low with progress + skippable steps</p>
    <div class="row scroll">
      ${[['Splash',splash],['Sign up',auth],['Verify OTP',otp],['Gender',gender],['Age',age],['Profession',prof],['Style quiz',taste],['Personalizing',building],['Membership',memberIntro]]
        .map((s,i)=>`${W.step(s[0],s[1])}${i<8?W.arrow():''}`).join('')}
    </div>
    <div class="legend"><b>Why these signals?</b> Gender + age + profession + the swipe quiz are the cold-start inputs for the recommendation engine — enough to assign a starting "style persona" and seed the home feed before any browsing data exists. Social login (Google/Apple) is offered alongside OTP so users can skip typing. The membership offer appears <b>after</b> value is shown, not before.</div>
  `;
})();
