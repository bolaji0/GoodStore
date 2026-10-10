'use strict';
(() => {
  const states=['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
  states.forEach(state=>{const option=document.createElement('option');option.value=state;option.textContent=state;document.getElementById('state').append(option);});
  const offers = {1:25000,2:45000,3:65000};
  const naira = n => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(Number(n));
  let quantity=1, started=false, submitting=false, created=false;
  const form=document.getElementById('order-form'), error=document.getElementById('form-error'), submit=document.getElementById('submit-order');
  // A small adapter to the supplied tracker, never a second analytics system.
  const queue=[];
  function track(name,meta){try{if(window.GoodStore && typeof GoodStore.track==='function') GoodStore.track(name,meta);else if(queue.length<30) queue.push([name,meta]);}catch(_){} }
  const flush=setInterval(()=>{if(window.GoodStore && typeof GoodStore.track==='function'){clearInterval(flush);queue.splice(0).forEach(([name,meta])=>{try{GoodStore.track(name,meta);}catch(_){}});}},500);
  setTimeout(()=>clearInterval(flush),60000);
  document.querySelectorAll('[data-quantity]').forEach(button=>button.addEventListener('click',()=>{
    quantity=Number(button.dataset.quantity);
    document.querySelectorAll('[data-quantity]').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    document.getElementById('package-name').textContent=quantity+' TrioGroom set'+(quantity>1?'s':'');
    document.getElementById('package-price').textContent=naira(offers[quantity]);
    document.getElementById('package-total').textContent=naira(offers[quantity]);
    const sticky=document.getElementById('sticky-price');sticky.textContent=naira(offers[quantity])+' ';const suffix=document.createElement('span');suffix.textContent='/ '+quantity+' kit'+(quantity>1?'s':'');sticky.append(suffix);
  }));
  function start(){if(!started){started=true;track('form_start');}}
  form.addEventListener('focusin',start);form.addEventListener('change',start);
  function phone(value){const clean=value.replace(/[\s()\-]/g,'');if(/^0[789]\d{9}$/.test(clean))return clean;if(/^\+?234[789]\d{9}$/.test(clean))return '0'+clean.replace(/^\+?234/,'');return null;}
  function fail(field,message,reason='invalid'){const el=document.getElementById(field);el.setAttribute('aria-invalid','true');error.textContent=message;error.hidden=false;track('form_validation_error',{field:field==='alternate'?'alternate_phone':field,reason});el.focus();}
  form.addEventListener('input',e=>e.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(submitting||created)return;start();error.hidden=true;
    const fullname=document.getElementById('fullname').value.trim(), primary=phone(document.getElementById('phone').value), alternate=phone(document.getElementById('alternate').value), city=document.getElementById('city').value.trim(),address=document.getElementById('address').value.trim();
    if(fullname.length<2)return fail('fullname','Please enter your full name.');
    if(!primary)return fail('phone','Enter a valid Nigerian phone number, e.g. 08012345678 or +2348012345678.');
    if(!alternate)return fail('alternate','Please enter a valid alternative Nigerian phone number.');
    if(primary===alternate)return fail('alternate','Use a different number for the alternative contact.','duplicate');
    if(!document.getElementById('state').value)return fail('state','Please select your delivery state.','required');
    if(city.length<2)return fail('city','Please enter your area or LGA.');
    if(address.length<10)return fail('address','Please add your house number, street and a nearby landmark.');
    if(!document.getElementById('consent').checked)return fail('consent','Please confirm you are available to receive and pay for your order.','required');
    submitting=true;submit.disabled=true;submit.textContent='Sending your order…';
    try{
      const gs=window.GoodStore;if(!gs||typeof gs.order!=='function')throw new Error('unavailable');
      if(typeof gs.ready==='function')await gs.ready();
      const result=await gs.order({quantity,customer_name:fullname,phone:primary,alternate_phone:alternate,state:document.getElementById('state').value,city,address});
      if(!result || result.ok!==true || !result.order || !result.order.id)throw new Error('not_created');
      created=true;
      const panel=document.getElementById('confirmation');panel.replaceChildren();
      const heading=document.createElement('h3');heading.textContent='Order received. Thank you!';panel.append(heading);
      const row=(text)=>{const p=document.createElement('p');p.textContent=text;panel.append(p);};
      row('Order reference: '+(result.order_id || result.order?.id || 'Contact support for your reference'));
      for(const [label,value] of [['Product',result.order.product_price],['Delivery',result.order.delivery_charge],['Pay on delivery',result.order.amount_due]]){row(label+': '+(value!==undefined && value!==null && Number.isFinite(Number(value))?naira(value):'Awaiting backend confirmation'));}
      row('GoodStore will contact you to confirm your delivery.');
      const link=document.createElement('a');link.href='https://wa.me/2348054624377?text='+encodeURIComponent('Hello GoodStore, please help with my TrioGroom order '+(result.order_id || result.order?.id || ''));link.className='text-link';link.textContent='Contact GoodStore on WhatsApp ↗';link.dataset.gsEvent='whatsapp_click';link.dataset.gsLabel='whatsapp_confirmation';panel.append(link);
      panel.hidden=false;panel.focus();submit.textContent='Order received ✓';
    }catch(_){error.textContent='We could not confirm your order. Please try again when your connection is stable, or contact WhatsApp support. If you already received a confirmation, contact support before retrying.';error.hidden=false;submit.disabled=false;submit.textContent='Retry my cash-on-delivery order ↗';}
    finally{submitting=false;}
  });
})();

// GIF-like demonstrations: load only nearby clips; play only visible clips.
// GoodStore attaches its normal video events using each stable data-gs-video ID.
(() => {
 const videos=[...document.querySelectorAll('video[data-gs-video]')];
 const reduced=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const prepare=video=>{if(video.dataset.src){video.src=video.dataset.src;delete video.dataset.src;video.load();}};
 if(!('IntersectionObserver' in window)){videos.forEach(prepare);return;}
 const loader=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){prepare(entry.target);loader.unobserve(entry.target);}}),{rootMargin:'250px'});
 const player=new IntersectionObserver(entries=>entries.forEach(entry=>{const video=entry.target;if(entry.isIntersecting){prepare(video);if(!reduced){const promise=video.play();if(promise && promise.catch)promise.catch(()=>{});}}else video.pause();}),{threshold:.25});
 videos.forEach(video=>{loader.observe(video);player.observe(video);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(video=>video.pause());});
})();


// Track actual section visibility and video playback (the current Worker tracker
// only automatically tracks page views, scroll depth and labelled clicks).
(() => {
  const send=(event,meta)=>{ if(window.GoodStore && typeof window.GoodStore.track==='function') window.GoodStore.track(event,meta); };
  const initialize=()=>{
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const el=entry.target; send(el.dataset.gsView,{section:el.dataset.gsView}); observer.unobserve(el);
      });},{threshold:0.2});
      document.querySelectorAll('[data-gs-view]').forEach(el=>observer.observe(el));
    }
    document.querySelectorAll('video[data-gs-video]').forEach(video=>{
      const id=video.dataset.gsVideo, seen=new Set();
      video.addEventListener('play',()=>send('video_play',{video_id:id}));
      video.addEventListener('pause',()=>send('video_pause',{video_id:id}));
      video.addEventListener('timeupdate',()=>{
        if(!Number.isFinite(video.duration)||video.duration<=0)return;
        const pct=video.currentTime/video.duration*100;
        for(const n of [25,50,75]){if(pct>=n&&!seen.has(n)){seen.add(n);send('video_'+n,{video_id:id});}}
      });
      video.addEventListener('ended',()=>send('video_complete',{video_id:id}));
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
