/* Home Feed — 4 directions */
(function(){
  const W=WF, board=document.getElementById('board-feed');
  const {ic,img,chips,phone,storiesRow,post,productCard,cell,note}=W;

  // A — IG classic: stories + vertical posts
  const A = phone(
    W.tbar('RG',{actions:['heart','bag']}) +
    storiesRow([{cap:'Your story'},'New Drop','Workwear','Denim','Party','Sale']) +
    post({brand:'RG Studio',name:'Relaxed Linen Shirt',price:'₹2,499',tag:'for your vibe',caption:'94% match · 4 colors'}) +
    post({brand:'Urban Co',name:'Cargo Joggers',price:'₹1,899',tag:'because you liked denim',h:150,caption:'trending in 18–24'})
  ,{nav:'home'});

  // B — personality carousels stacked
  const carousel=(title,sub)=>`<div class="col" style="padding:10px 0 12px;border-bottom:1.5px solid var(--fill2)">
    <div class="row2 between center" style="padding:0 12px 6px"><div class="col gap4"><span class="tt" style="font-size:14px">${title}</span><span class="xs">${sub}</span></div>${ic('chev')}</div>
    <div class="row2 gap8" style="padding:0 12px;overflow:hidden">
      ${productCard({h:120})}${productCard({h:120,name:'Wide Trousers',price:'₹1,799'})}<div style="flex:0 0 40px">${img(120,'')}</div>
    </div></div>`;
  const B = phone(
    W.tbar('Home',{actions:['search','bag']}) +
    `<div style="overflow:hidden">
      ${carousel('Made for your vibe','creative · relaxed fits')}
      ${carousel('Workwear edit','smart looks for 9–6')}
      ${carousel('Trending in 18–24','what your age is loving')}
    </div>`
  ,{nav:'home'});

  // C — hybrid mixed feed
  const C = phone(
    W.tbar('RG',{actions:['cam','bag']}) +
    storiesRow([{cap:'You'},'Drops','Picks','Sale']) +
    post({name:'Oversized Blazer',price:'₹3,299',tag:'top pick today',h:160}) +
    `<div class="col" style="padding:10px 0;border-bottom:1.5px solid var(--fill2)">
      <div class="row2 between center" style="padding:0 12px 6px"><span class="tt" style="font-size:13px">More like this →</span></div>
      <div class="row2 gap8" style="padding:0 12px;overflow:hidden">${productCard({h:96})}${productCard({h:96,name:'Knit Polo',price:'₹999'})}</div>
    </div>` +
    post({name:'Pleated Skirt',price:'₹1,499',tag:'matched to quiz',h:120})
  ,{nav:'home'});

  // D — discovery grid / explore masonry
  const D = phone(
    W.tbar('Explore',{actions:['filter']}) +
    `<div style="padding:8px 12px">${chips([{t:'For you',on:true},'Tops','Denim','Ethnic','Shoes','Sale'])}</div>
    <div style="padding:0 10px;overflow:hidden">
      <div style="columns:2;column-gap:8px">
        ${[180,120,150,200,110,160].map((h,i)=>`<div style="break-inside:avoid;margin-bottom:8px">${img(h,'')}<div class="xs" style="margin-top:2px">₹${[1299,899,2499,1799,599,1999][i]}</div></div>`).join('')}
      </div>
    </div>`
  ,{nav:'search'});

  board.innerHTML=`
    <div class="board-head"><h2>Home Feed</h2><p>The Instagram-style heart of the app. Same engine, four layout philosophies — from a literal social feed to a Pinterest-style discovery grid.</p></div>
    <div class="row">
      ${cell('<b>A.</b> Social feed','Stories rail + full-bleed product "posts" you scroll vertically. Most Instagram-like — like, share, try-on & save per post.',A)}
      ${cell('<b>B.</b> Persona carousels','Horizontally-swipeable rows grouped by persona ("your vibe", "workwear", "trending in your age"). Browsing, not scrolling.',B)}
      ${cell('<b>C.</b> Hybrid','Posts interleaved with "more like this" mini-carousels — engine reacts inline as you scroll. Best of both.',C)}
      ${cell('<b>D.</b> Discovery grid','Masonry explore grid behind a "For you" chip bar. Dense, fast-scanning, great for big catalogs.',D)}
    </div>
    <div class="notecol" style="max-width:none;flex-direction:row;justify-content:center;margin-top:24px">
      ${note('Stories = brand drops, sales, lookbooks, restocks — tappable full-screen.')}
      ${note('Every card carries a 1-tap <b>Try-On</b> & <b>Save</b>. "% match" makes the engine visible.')}
      ${note('Bottom nav is shared across the app: Home · Explore · Try-On · Saved · You.')}
    </div>`;
})();
