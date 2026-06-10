/* Admin app — recommendation engine + store control (desktop windows) */
(function(){
  const W=WF, board=document.getElementById('board-admin');
  const {ic,chips,img,note}=W;

  function win(active,title,content){
    const nav=[['chart','Dashboard'],['sparkle','Recommendation engine'],['box','Catalog'],['user','Members'],['layers','Stories & feed'],['tag','Memberships'],['sliders','Settings']];
    return `<div class="win"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">admin.rgretailer.app / ${title.toLowerCase()}</span></div>
      <div class="body"><div class="side"><div class="logo" style="font-size:18px;margin-bottom:12px"><span class="mark" style="width:26px;height:26px;font-size:14px">RG</span>Admin</div>
        <div class="nav">${nav.map(([i,l])=>`<a class="${l===active?'on':''}">${ic(i)} ${l}</a>`).join('')}</div></div>
        <div class="content">${content}</div></div></div>`;
  }
  const ln=(w)=>`<div class="ln" style="width:${w}%"></div>`;

  // Dashboard
  const dash=win('Dashboard','dashboard',`
    <div class="row2 between center" style="margin-bottom:14px"><div class="tt" style="font-size:18px">Store overview</div><div class="row2 gap6">${chips(['Today','7d','30d'])}</div></div>
    <div class="row2 gap10" style="margin-bottom:14px">
      ${[['Revenue','₹4.8L'],['Orders','312'],['Try-ons','1,940'],['Feed CTR','7.2%']].map(([l,v])=>`<div class="kpi"><div class="xs">${l}</div><div class="big">${v}</div></div>`).join('')}</div>
    <div class="row2 gap10">
      <div class="kpi" style="flex:2"><div class="sm" style="margin-bottom:8px">Recommendation performance</div><div style="display:flex;align-items:flex-end;gap:6px;height:90px">${[40,65,52,80,72,90,60].map(h=>`<div style="flex:1;background:var(--accent-soft);border:1.4px solid var(--line);height:${h}%"></div>`).join('')}</div></div>
      <div class="kpi"><div class="sm" style="margin-bottom:6px">Top personas</div>${['Creative · 18–24','Corporate · 25–34','Campus casual'].map(p=>`<div class="row2 between" style="padding:4px 0"><span class="xs">${p}</span><span class="xs">${ic('chev')}</span></div>`).join('')}</div>
    </div>`);

  // Recommendation engine — the core
  const engine=win('Recommendation engine','engine',`
    <div class="row2 between center" style="margin-bottom:12px"><div class="tt" style="font-size:18px">Recommendation engine</div><div class="btn pri sm">+ New rule</div></div>
    <div class="row2 gap10">
      <div style="flex:1.4">
        <div class="sm" style="margin-bottom:6px">Active rules</div>
        ${[['Workwear → Corporate, 25–44','on'],['New drops → matched personas','on'],['Liked denim → similar fits','on'],['Low stock → boost in feed','off']].map(([r,s])=>`<div class="tablerow"><span class="grow sm">${r}</span><div class="toggle ${s==='on'?'on':''}"></div></div>`).join('')}
        <div class="sm" style="margin:12px 0 6px">Build a rule</div>
        <div style="border:1.6px dashed var(--line);border-radius:10px;padding:12px" class="col gap8">
          <div class="row2 gap6 center"><span class="xs">WHEN</span>${chips([{t:'persona = Creative',on:1}])}${chips([{t:'+ age 18–24'}])}</div>
          <div class="row2 gap6 center"><span class="xs">SHOW</span>${chips([{t:'collection = Relaxed fits',on:1}])}${chips([{t:'+ boost ×1.5'}])}</div>
          <div class="row2 gap6 center"><span class="xs">PLACE</span>${chips([{t:'Home feed',on:1},'Carousel','Stories'])}</div>
          <div class="btn pri sm" style="align-self:flex-start">Save rule</div>
        </div>
      </div>
      <div class="kpi" style="flex:1"><div class="sm" style="margin-bottom:8px">Live preview · feed for "Creative 18–24"</div>
        <div class="col gap6">${[0,1,2].map(()=>`<div class="row2 gap6 center">${img(38,'')}<div class="col grow gap4">${ln(80)}${ln(50)}</div><span class="badge">94%</span></div>`).join('')}</div>
        <div class="xs" style="margin-top:8px">Weights: taste 40% · profession 25% · age 15% · trend 20%</div>
        <div class="col gap4" style="margin-top:6px">${['Taste','Profession','Age','Trending'].map((l,i)=>`<div class="row2 gap6 center"><span class="xs" style="width:64px">${l}</span><div style="flex:1;height:6px;background:var(--fill);border-radius:6px"><div style="width:${[40,25,15,20][i]*2}%;height:100%;background:var(--accent);border-radius:6px"></div></div></div>`).join('')}</div>
      </div>
    </div>`);

  // Catalog
  const catalog=win('Catalog','catalog',`
    <div class="row2 between center" style="margin-bottom:12px"><div class="tt" style="font-size:18px">Products · 2,418</div><div class="row2 gap6">${chips(['All','Live','Draft','Low stock'])}<div class="btn pri sm">+ Add product</div></div></div>
    <div class="tablerow" style="font-weight:bold"><span style="width:46px"></span><span class="grow xs">Product</span><span class="xs" style="width:70px">Price</span><span class="xs" style="width:60px">Stock</span><span class="xs" style="width:80px">Personas</span><span class="xs" style="width:70px">Try-on</span></div>
    ${[['Relaxed Linen Shirt','₹2,499','42','Creative','✓ ready'],['Cargo Joggers','₹1,899','08','Campus','✓ ready'],['Oversized Blazer','₹3,299','15','Corporate','⚙ setup'],['Pleated Skirt','₹1,499','60','Creative','✓ ready']].map(r=>`<div class="tablerow">${img(38,'')}<span class="grow sm">${r[0]}</span><span class="sm" style="width:70px">${r[1]}</span><span class="sm" style="width:60px">${r[2]}</span><span style="width:80px">${chips([r[3]])}</span><span class="xs" style="width:70px">${r[4]}</span></div>`).join('')}`);

  // Stories & feed manager
  const stories=win('Stories & feed','stories',`
    <div class="row2 between center" style="margin-bottom:12px"><div class="tt" style="font-size:18px">Stories &amp; feed control</div><div class="btn pri sm">+ Post story</div></div>
    <div class="sm" style="margin-bottom:6px">Scheduled stories</div>
    <div class="row2 gap10" style="margin-bottom:14px">${['Summer Drop','Flat 40% Sale','New Denim','Lookbook'].map(s=>`<div class="col gap4" style="width:90px">${img(110,'')}<span class="xs">${s}</span><div class="row2 between"><span class="xs">→ all</span><div class="toggle on" style="transform:scale(.8)"></div></div></div>`).join('')}</div>
    <div class="sm" style="margin-bottom:6px">Feed sections (drag to reorder)</div>
    ${[['Stories rail','everyone'],['Made for your vibe','persona-matched'],['Workwear edit','Corporate'],['Trending in your age','age-matched'],['On sale','everyone']].map(([s,a])=>`<div class="tablerow"><span class="xs">⠿</span><span class="grow sm">${s}</span>${chips([a])}<div class="toggle on"></div></div>`).join('')}`);

  // Memberships config
  const members=win('Memberships','memberships',`
    <div class="tt" style="font-size:18px;margin-bottom:12px">Membership tiers</div>
    <div class="row2 gap10">${[['Free','₹0','1,820 users'],['Plus','₹199/mo','640 users'],['VIP','₹499/mo','190 users']].map(([n,p,u],i)=>`<div class="kpi" style="${i===2?'background:var(--accent-soft)':''}"><div class="tt">RG ${n}</div><div class="big" style="font-size:20px">${p}</div><div class="xs">${u}</div>
      <div class="col gap4" style="margin:8px 0">${['Try-on limit','Discount %','Free delivery','Stylist'].map(f=>`<div class="row2 between"><span class="xs">${f}</span><span class="xs" style="border-bottom:1.2px dashed var(--line)">edit</span></div>`).join('')}</div>
      <div class="btn sm full">Edit benefits</div></div>`).join('')}</div>
    <div class="sm" style="margin:14px 0 6px">Coupons & offers</div>
    ${[['RG10 · 10% off','active'],['WELCOME · ₹200 off first order','active'],['VIP12 · members only','scheduled']].map(([c,s])=>`<div class="tablerow"><span class="grow sm">${ic('tag')} ${c}</span>${chips([s])}<div class="toggle ${s==='active'?'on':''}"></div></div>`).join('')}`);

  board.innerHTML=`
    <div class="board-head"><h2>Admin App</h2><p>Where you run everything — the recommendation engine, catalog, the Instagram-style feed & stories, members, tiers and offers. Shown as a desktop console.</p></div>
    <div class="flowlabel">Command center</div><p class="flowsub">The recommendation engine is the centerpiece — visual rules + live preview</p>
    <div class="col gap12" style="align-items:center;gap:34px">
      ${engine}
      <div class="notecol" style="max-width:760px;flex-direction:row;justify-content:center">${note('Rules are visual: <b>WHEN</b> persona/age/behavior → <b>SHOW</b> collection → <b>PLACE</b> in feed/story/carousel.')}${note('Tune engine <b>weights</b> (taste / profession / age / trend) and preview the resulting feed instantly.')}</div>
      ${dash}${catalog}${stories}${members}
    </div>`;
})();
