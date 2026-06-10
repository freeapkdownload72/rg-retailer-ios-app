/* Commerce — search, filters, wishlist, cart, checkout, orders, profile/wallet */
(function(){
  const W=WF, board=document.getElementById('board-commerce');
  const {ic,img,chips,phone,step,arrow,note,productCard}=W;

  // search + filters
  const search=phone(`<div class="tbar"><div class="iconbtn">${ic('back')}</div><div class="row2 grow center" style="border:1.6px solid var(--line);border-radius:20px;padding:6px 12px;margin:0 8px">${ic('search')}<span class="sm">linen shirt</span></div>${ic('filter')}</div>
    <div class="pad" style="padding:8px 12px"><div class="row2 wrap gap6">${chips([{t:'Under ₹2k',on:true},'Size M','Sand','4★+','In stock'])}</div></div>
    <div style="padding:0 10px;columns:2;column-gap:8px">${[140,110,160,120].map(h=>`<div style="break-inside:avoid;margin-bottom:8px">${img(h,'')}</div>`).join('')}</div>`,{nav:'search'});

  const filters=phone(W.tbar('Filters',{back:true})+`<div class="pad col gap10">
    <span class="tt" style="font-size:14px">Price</span><div style="height:5px;background:var(--fill);border-radius:6px;position:relative"><div style="position:absolute;left:10%;right:35%;height:100%;background:var(--accent);border-radius:6px"></div></div>
    <span class="tt" style="font-size:14px">Size</span><div class="row2 gap6">${['XS','S','M','L','XL'].map((s,i)=>`<div class="chip ${i===2?'on':''}">${s}</div>`).join('')}</div>
    <span class="tt" style="font-size:14px">Color</span><div class="row2 gap6">${[0,1,2,3,4].map(i=>`<div style="width:26px;height:26px;border-radius:50%;border:1.6px solid var(--line);background:var(--fill${i%2?'2':''})"></div>`).join('')}</div>
    <span class="tt" style="font-size:14px">Rating</span><div class="row2 wrap gap6">${chips(['4★ & up','3★ & up'])}</div>
    <div style="flex:1"></div><div class="row2 gap8"><div class="btn grow">Clear</div><div class="btn pri grow">Show 248</div></div></div>`);

  // wishlist
  const wishlist=phone(W.tbar('Saved',{actions:['share']})+`<div class="pad" style="padding:8px 12px"><div class="row2 wrap gap6">${chips([{t:'All 24',on:true},'Tops','Looks','Wishlist'])}</div></div>
    <div style="padding:0 12px"><div class="row2 wrap gap8">${productCard({heart:1,tryon:1})}${productCard({heart:1,name:'Knit Polo',price:'₹999',tryon:1})}</div></div>`,{nav:'heart'});

  // cart
  const cart=phone(W.tbar('Bag',{back:true})+`<div class="pad col gap8">
    ${[['Relaxed Linen Shirt','₹2,499'],['Cargo Joggers','₹1,899']].map(([n,p])=>`<div class="row2 gap8" style="border-bottom:1.4px dashed var(--fill2);padding-bottom:8px">${img(64,'')}<div class="col grow gap4"><span class="tt" style="font-size:13px">${n}</span><span class="xs">Size M · Sand</span><div class="row2 gap6"><div class="chip" style="padding:2px 9px">−</div><span class="sm">1</span><div class="chip" style="padding:2px 9px">+</div></div></div><span class="tt" style="font-size:13px">${p}</span></div>`).join('')}
    <div class="row2 between center" style="border:1.6px dashed var(--line);border-radius:10px;padding:8px 10px">${ic('tag')}<span class="sm grow">Apply coupon</span><span class="xs">RG10 ✓ −₹440</span></div>
    <div class="col gap4"><div class="row2 between"><span class="sm">Subtotal</span><span class="sm">₹4,398</span></div><div class="row2 between"><span class="sm">Member discount</span><span class="sm">−₹220</span></div><div class="row2 between"><span class="tt">Total</span><span class="tt">₹3,738</span></div></div>
    <div class="btn pri full">Checkout</div></div>`);

  // checkout
  const checkout=phone(W.tbar('Checkout',{back:true})+`<div class="pad col gap10">
    <div class="col gap4"><span class="xs">Deliver to</span><div style="border:1.6px solid var(--line);border-radius:10px;padding:8px"><div class="row2 between center"><span class="tt" style="font-size:13px">${ic('pin')} Home</span><span class="xs">Change</span></div><div class="ln" style="width:80%"></div></div></div>
    <span class="xs">Payment</span>
    <div class="col gap6">${['UPI / GPay','Card','Cash on delivery','RG Wallet ₹250'].map((m,i)=>`<div class="row2 between center" style="border:1.6px solid var(--line);border-radius:10px;padding:9px 10px;${i===0?'background:var(--accent-soft)':''}"><span class="sm">${m}</span><div style="width:16px;height:16px;border-radius:50%;border:1.6px solid var(--line);${i===0?'background:var(--accent)':''}"></div></div>`).join('')}</div>
    <div class="row2 between center"><span class="tt">Pay ₹3,738</span><div class="btn pri">Place order ${ic('check')}</div></div></div>`);

  // order tracking
  const track=phone(W.tbar('Order #RG2841',{back:true})+`<div class="pad col gap10">
    <div class="row2 gap8">${img(60,'')}<div class="col gap4"><span class="tt" style="font-size:13px">2 items · ₹3,738</span><span class="xs">Arriving Tue, 14 Jun</span></div></div>
    <div class="col gap2" style="margin-top:4px">${[['Confirmed',1],['Packed',1],['Shipped',1],['Out for delivery',0],['Delivered',0]].map(([s,done],i)=>`<div class="row2 gap8 center"><div style="width:14px;height:14px;border-radius:50%;border:1.8px solid var(--line);${done?'background:var(--accent)':''}"></div><span class="sm" style="${done?'':'color:var(--ink2)'}">${s}</span></div>${i<4?'<div style="width:14px;height:14px;border-left:1.8px solid var(--line);margin:1px 0"></div>':''}`).join('')}</div>
    <div class="btn full">Track on map</div><div class="row2 gap8"><div class="btn grow">Return / exchange</div><div class="btn grow">Get help</div></div></div>`);

  // profile + wallet (membership badge)
  const profile=phone(W.tbar('You',{actions:['bell']})+`<div class="pad col gap10">
    <div class="row2 gap10 center"><div class="story"><div class="ring" style="width:54px;height:54px"><div class="in"></div></div></div><div class="col gap4"><span class="tt">Aanya R.</span><span class="badge">★ RG Plus member</span></div></div>
    <div class="row2 gap8">${['Orders','Wishlist','Wallet ₹250'].map(k=>`<div class="kpi" style="text-align:center;padding:8px"><div class="tt" style="font-size:13px">${k}</div></div>`).join('')}</div>
    <div class="col gap2">${[['box','My orders'],['heart','Saved & looks'],['wallet','Wallet & loyalty'],['pin','Addresses'],['tag','Coupons & offers'],['sliders','Style preferences']].map(([i,l])=>`<div class="row2 between center" style="padding:9px 2px;border-bottom:1.4px dashed var(--fill2)"><span class="row2 gap8 center sm">${ic(i)} ${l}</span>${ic('chev')}</div>`).join('')}</div></div>`,{nav:'user'});

  board.innerHTML=`
    <div class="board-head"><h2>Commerce Essentials</h2><p>The must-have retail plumbing — search & filters, wishlist, bag, checkout, order tracking, returns, coupons, wallet/loyalty and the membership-aware profile.</p></div>
    <div class="flowlabel">Find → buy → track</div>
    <p class="flowsub">Coupons, member discount & wallet all fold into one checkout</p>
    <div class="row scroll">
      ${step('Search',search)}${arrow()}${step('Filters',filters)}${arrow()}${step('Bag',cart)}${arrow()}${step('Checkout',checkout)}${arrow()}${step('Track order',track)}
    </div>
    <div class="flowlabel">Save & manage</div>
    <p class="flowsub">Wishlist, saved looks, and a profile that shows your tier, wallet & loyalty</p>
    <div class="row">
      ${step('Wishlist & looks',wishlist)}${step('Profile / membership',profile)}
      <div class="notecol">${note('Returns/exchanges launch right from the order screen.')}${note('Member tier changes pricing live in the bag (discount line).')}${note('Wallet + loyalty points are a VIP perk — earn 2×.')}</div>
    </div>`;
})();
