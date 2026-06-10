/* Product detail & Virtual Try-On — 4 PDP directions + try-on flow */
(function(){
  const W=WF, board=document.getElementById('board-product');
  const {ic,img,chips,phone,cell,step,note,arrow}=W;

  const sizes=`<div class="row2 gap6">${['S','M','L','XL'].map((s,i)=>`<div class="chip ${i===1?'on':''}" style="padding:7px 13px">${s}</div>`).join('')}</div>`;
  const stars=`<span class="tt" style="font-size:12px;color:var(--accent)">★★★★☆ <span class="xs">4.4 · 212</span></span>`;

  // A — standard PDP
  const A = phone(
    W.tbar('',{back:true,actions:['heart','share']}) +
    img(228,'product · swipe ◦◦◦') +
    `<div class="pad col gap8">
      <div class="row2 between center"><span class="tt">Relaxed Linen Shirt</span><span class="tt">₹2,499</span></div>
      ${stars}
      <div class="xs">Color: Sand</div><div class="row2 gap6">${['','','',''].map((_,i)=>`<div style="width:24px;height:24px;border-radius:50%;border:1.6px solid var(--line);background:var(--fill${i?'2':''})"></div>`).join('')}</div>
      <div class="xs">Size</div>${sizes}
      <div class="btn full" style="margin-top:4px">${ic('cam')} &nbsp;Try it on me</div>
      <div class="row2 gap8"><div class="btn grow">Add to bag</div><div class="btn pri grow">Buy now</div></div>
    </div>`
  );

  // B — try-on first PDP
  const B = phone(
    W.tbar('',{back:true,actions:['share']}) +
    `<div style="position:relative">${img(250,'YOU wearing it')}<div style="position:absolute;top:8px;left:8px" class="badge">${ic('cam')} on you</div>
      <div style="position:absolute;bottom:8px;left:8px;right:8px" class="row2 gap6"><div class="chip soft">Your photo</div><div class="chip">Model</div><div class="chip">Flat</div></div></div>
    <div class="pad col gap8">
      <div class="row2 between center"><span class="tt">Relaxed Linen Shirt</span><span class="tt">₹2,499</span></div>
      <div class="xs">Looks great on your build · M recommended</div>
      ${sizes}
      <div class="row2 gap8"><div class="btn grow">Add to bag</div><div class="btn pri grow">Buy now</div></div>
    </div>`
  );

  // C — social/post-style PDP
  const C = phone(
    W.tbar('',{back:true,actions:['share']}) +
    img(190,'product') +
    `<div class="row2 between center" style="padding:8px 12px 2px"><div class="row2 gap10">${ic('heart')}${ic('cam')}${ic('share')}</div>${ic('bag')}</div>
    <div class="pad col gap8" style="padding:4px 12px">
      <div class="row2 between center"><span class="tt">Relaxed Linen Shirt</span><span class="tt">₹2,499</span></div>
      <div class="sm">2,114 saved this · styled by 38 members</div>
      <div class="row2 gap6" style="overflow:hidden">${img(70,'')}${img(70,'')}${img(70,'')}</div>
      <div class="xs">★ Reviews</div>
      <div class="col gap4" style="border-top:1.4px dashed var(--fill2);padding-top:6px">${stars}<div class="ln" style="width:90%"></div><div class="ln" style="width:60%"></div></div>
      <div class="btn pri full">${ic('cam')} Try on &nbsp;·&nbsp; Add to bag</div>
    </div>`
  );

  // D — try-on studio entry from PDP
  const D = phone(
    W.tbar('Try-On Studio',{back:true}) +
    `<div class="pad col gap8">
      <div class="row2 gap8"><div class="grow">${img(150,'YOU + item')}</div><div class="col gap6" style="width:64px">${img(46,'')}${img(46,'')}<div class="chip" style="text-align:center;font-size:10px">+ swap</div></div></div>
      <div class="sm">Mix & match · build a full look</div>
      <div class="row2 wrap gap6">${chips(['Shirt','+ Trousers','+ Shoes','+ Jacket'])}</div>
      <div class="row2 between center"><span class="tt">Total look</span><span class="tt">₹6,797</span></div>
      <div class="btn pri full">Add look to bag</div>
      <div class="xs" style="text-align:center">Save look · Share to story</div>
    </div>`
  ,{nav:'cam'});

  // try-on flow
  const f1=phone(W.tbar('Try it on me',{back:true})+`<div class="pad col center gap10" style="justify-content:center;height:90%">
    <div style="width:120px;height:160px;border:2px dashed var(--line);border-radius:14px;display:grid;place-items:center;color:var(--ink2)">${ic('user','ic')}</div>
    <div class="btn pri full">${ic('cam')} Take a photo</div>
    <div class="btn full">${ic('upload')} Upload from gallery</div>
    <div class="xs" style="text-align:center">Photos are processed privately. Reuse a saved photo anytime.</div></div>`);
  const f2=phone(W.tbar('Analyzing…',{back:true})+`<div class="pad col center gap12" style="justify-content:center;height:90%;text-align:center">
    <div style="position:relative;width:130px">${img(180,'your photo')}<div style="position:absolute;left:0;right:0;top:50%;height:2px;background:var(--accent)"></div></div>
    <div class="tt">Mapping fit & body shape…</div><div class="xs">Detecting size · draping fabric · matching lighting</div></div>`);
  const f3=phone(W.tbar('On you',{back:true,actions:['share']})+`<div style="position:relative">${img(250,'YOU wearing it')}<div style="position:absolute;top:8px;right:8px" class="badge">AI preview</div></div>
    <div class="pad col gap8"><div class="row2 between center"><span class="tt">Relaxed Linen Shirt</span><span class="tt">₹2,499</span></div>
    <div class="row2 wrap gap6">${chips([{t:'Sand',on:true},'Olive','Black'])}</div>
    <div class="sm">Try other sizes:</div>${sizes}
    <div class="row2 gap8"><div class="btn grow">Save look</div><div class="btn pri grow">Add to bag</div></div></div>`);

  board.innerHTML=`
    <div class="board-head"><h2>Product Detail &amp; Virtual Try-On</h2><p>Try-On is a hero feature, so it shapes the whole PDP. Four ways to frame the product page, plus the upload→analyze→result flow that powers the "try it on me" button everywhere.</p></div>
    <div class="row">
      ${cell('<b>A.</b> Classic PDP','Familiar e-com layout. Try-on lives as a secondary button under size/color. Safe & legible.',A)}
      ${cell('<b>B.</b> Try-on-first','Hero is YOU wearing it; toggle between your photo / model / flat-lay. Try-on is the headline.',B)}
      ${cell('<b>C.</b> Social PDP','Looks like an IG post — saves, member styling, reviews inline. Leans into the social brand.',C)}
      ${cell('<b>D.</b> Look studio','Try-on becomes a mix-&-match studio: build a full outfit on yourself and buy the look.',D)}
    </div>
    <div class="flowlabel">The "Try it on me" flow</div>
    <p class="flowsub">One tap from any product card or PDP · result is shareable & savable</p>
    <div class="row scroll">
      ${step('1 · Source photo',f1)}${arrow()}${step('2 · Instant analysis',f2)}${arrow()}${step('3 · See it on you',f3)}
      <div class="notecol">${note('Saved body photo means future try-ons are <b>instant</b> — no re-upload.')}${note('Free tier = 1 try-on/day · Plus & VIP = unlimited (ties into memberships).')}</div>
    </div>`;
})();
