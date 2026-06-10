/* Memberships — Free + Plus + VIP, 4 paywall directions */
(function(){
  const W=WF, board=document.getElementById('board-membership');
  const {ic,img,chips,phone,cell,note}=W;
  const tiers=[
    {n:'Free',p:'₹0',sub:'browse & dabble',f:['Full catalog & feed','1 try-on / day','Standard delivery']},
    {n:'Plus',p:'₹199',sub:'most popular',f:['Unlimited try-on','Free delivery','Early access to sales','5% member discount']},
    {n:'VIP',p:'₹499',sub:'the full RG',f:['Everything in Plus','Personal stylist chat','First dibs on drops','12% discount + free returns','2× loyalty points']}
  ];

  // A — vertical stacked cards
  const A = phone(W.tbar('Membership',{back:true})+`<div class="pad col gap10">
    <div class="sm">Upgrade for unlimited try-on & perks.</div>
    ${tiers.map((t,i)=>`<div style="border:${i===1?'2.4px':'1.6px'} solid var(--line);border-radius:14px;padding:12px;${i===1?'background:var(--accent-soft)':''}">
      <div class="row2 between center"><span class="tt">RG ${t.n}</span>${i===1?'<span class="badge">popular</span>':''}</div>
      <div class="row2 between center"><span class="xs">${t.sub}</span><span class="tt">${t.p}${i?'/mo':''}</span></div>
      <div class="col gap4" style="margin-top:6px">${t.f.slice(0,2).map(f=>`<span class="xs">✓ ${f}</span>`).join('')}</div>
      <div class="btn ${i===1?'pri':''} full sm" style="margin-top:8px">${i===0?'Current plan':'Choose '+t.n}</div></div>`).join('')}
  </div>`);

  // B — segmented toggle comparison (one tier at a time)
  const B = phone(W.tbar('Go Plus',{back:true})+`<div class="pad col gap10">
    <div class="row2 gap4" style="border:1.6px solid var(--line);border-radius:11px;padding:3px">
      ${['Free','Plus','VIP'].map((t,i)=>`<div class="grow chip ${i===1?'on':''}" style="text-align:center;border:none;border-radius:8px">${t}</div>`).join('')}</div>
    ${img(96,'RG Plus · hero')}
    <div class="row2 between center"><span class="tt" style="font-size:20px">RG Plus</span><span class="tt">₹199/mo</span></div>
    <div class="xs">Billed monthly · cancel anytime · 7-day free trial</div>
    <div class="col gap6" style="border-top:1.4px dashed var(--fill2);padding-top:8px">
      ${tiers[1].f.map(f=>`<span class="sm">✓ ${f}</span>`).join('')}</div>
    <div style="flex:1"></div>
    <div class="btn pri full">Start 7-day free trial</div>
  </div>`);

  // C — horizontal swipeable tier cards
  const C = phone(W.tbar('Choose your tier',{back:true})+`<div class="pad" style="padding:10px 0">
    <div class="sm" style="padding:0 12px 8px">Swipe to compare →</div>
    <div class="row2 gap10" style="padding:0 12px;overflow:hidden">
      ${tiers.map((t,i)=>`<div style="flex:0 0 150px;border:${i===2?'2.4px':'1.6px'} solid var(--line);border-radius:16px;padding:12px;${i===2?'background:var(--accent-soft)':''}">
        <div class="tt" style="font-size:18px">RG ${t.n}</div><div class="tt">${t.p}${i?'/mo':''}</div>
        <div class="col gap4" style="margin:8px 0">${t.f.map(f=>`<span class="xs">✓ ${f}</span>`).join('')}</div>
        <div class="btn ${i===2?'pri':''} full sm">${i===0?'Free':'Pick'}</div></div>`).join('')}
    </div></div>`);

  // D — feature comparison table
  const rows=[['Catalog & feed','✓','✓','✓'],['Try-on / day','1','∞','∞'],['Free delivery','—','✓','✓'],['Member discount','—','5%','12%'],['Personal stylist','—','—','✓'],['Early drops','—','✓','✓✓']];
  const D = phone(W.tbar('Compare plans',{back:true})+`<div class="pad col" style="padding:10px 10px">
    <div class="row2" style="border-bottom:1.6px solid var(--line);padding-bottom:6px">
      <span class="grow xs"></span>${['Free','Plus','VIP'].map((t,i)=>`<span class="tt" style="width:48px;text-align:center;font-size:12px;${i===2?'color:var(--accent)':''}">${t}</span>`).join('')}</div>
    ${rows.map(r=>`<div class="row2" style="padding:7px 0;border-bottom:1.4px dashed var(--fill2)"><span class="grow xs">${r[0]}</span>${r.slice(1).map(c=>`<span style="width:48px;text-align:center" class="sm">${c}</span>`).join('')}</div>`).join('')}
    <div class="row2 gap6" style="margin-top:10px"><div class="btn grow sm">Free</div><div class="btn grow sm">Plus</div><div class="btn pri grow sm">VIP</div></div>
  </div>`);

  board.innerHTML=`
    <div class="board-head"><h2>Memberships</h2><p>Three tiers — <b>Free</b>, <b>Plus</b>, <b>VIP</b> — with try-on limits, discounts, delivery & a personal stylist as the differentiators. (Exact benefits are placeholders — swap freely.) Four ways to present the upgrade.</p></div>
    <div class="row">
      ${cell('<b>A.</b> Stacked cards','All three visible at once, "popular" highlighted. Classic, scannable.',A)}
      ${cell('<b>B.</b> Focused + toggle','Segmented control shows one tier in full with a free-trial CTA. Conversion-focused.',B)}
      ${cell('<b>C.</b> Swipe cards','Big swipeable tier cards. Playful, fits the Gen-Z vibe.',C)}
      ${cell('<b>D.</b> Comparison table','Feature-by-feature grid for decisive comparers.',D)}
    </div>
    <div class="notecol" style="max-width:none;flex-direction:row;justify-content:center;margin-top:24px">
      ${note('Try-on limit is the natural upsell hook — Free hits "1/day", upgrade unlocks ∞.')}
      ${note('Member badge + perks surface in the <b>Profile</b> tab (see Commerce board).')}
      ${note('Tiers, prices & every benefit are <b>editable from the Admin app</b>.')}
    </div>`;
})();
