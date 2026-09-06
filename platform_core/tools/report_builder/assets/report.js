(function(){
  var cards = Array.prototype.slice.call(document.querySelectorAll('details.tc'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('details.section-collapse'));
  var categories = Array.prototype.slice.call(document.querySelectorAll('details.tc-category'));
  var search = document.getElementById('tcSearch');
  var statusSel = document.getElementById('tcStatusFilter');
  var categorySel = document.getElementById('tcCategoryFilter');
  var countEl = document.getElementById('tcCount');
  var noResultsEl = document.getElementById('tcNoResults');
  var resetBtn = document.getElementById('tcResetFilters');
  var expandBtn = document.getElementById('tcExpandAll');
  var collapseBtn = document.getElementById('tcCollapseAll');

  var hasToolbar = !!(search && statusSel && categorySel && countEl && noResultsEl);

  function applyFilter(){
    if (!hasToolbar) return;
    var q = search.value.trim().toLowerCase();
    var status = statusSel.value;
    var category = categorySel.value;
    var visible = 0;
    cards.forEach(function(card){
      var matchesStatus = !status || card.getAttribute('data-status') === status;
      var matchesText = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
      var matchesCategory = !category || card.closest('details.tc-category').getAttribute('data-cat') === category;
      var show = matchesStatus && matchesText && matchesCategory;
      card.classList.toggle('js-hidden', !show);
      if (show) visible++;
      if (show && q) card.open = true;
    });
    categories.forEach(function(cat){
      var anyVisible = cat.querySelector('details.tc:not(.js-hidden)');
      var matchesCategory = !category || cat.getAttribute('data-cat') === category;
      cat.classList.toggle('cat-empty', !anyVisible || !matchesCategory);
      if (anyVisible && matchesCategory && (q || status || category)) cat.open = true;
    });
    countEl.textContent = visible + ' / ' + cards.length + ' shown';
    noResultsEl.classList.toggle('js-hidden', visible !== 0);
  }

  if (hasToolbar) {
    search.addEventListener('input', applyFilter);
    statusSel.addEventListener('change', applyFilter);
    categorySel.addEventListener('change', applyFilter);
  }
  if (resetBtn) resetBtn.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    search.value = '';
    statusSel.value = '';
    categorySel.value = '';
    applyFilter();
  });
  if (expandBtn) expandBtn.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    cards.forEach(function(c){ c.open = true; });
    sections.forEach(function(s){ s.open = true; });
    categories.forEach(function(c){ c.open = true; });
  });
  if (collapseBtn) collapseBtn.addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    cards.forEach(function(c){ c.open = false; });
    sections.forEach(function(s){ s.open = false; });
    categories.forEach(function(c){ c.open = false; });
  });

  categories.forEach(function(cat){
    var catCards = Array.prototype.slice.call(cat.querySelectorAll('details.tc'));
    var catExpandBtn = cat.querySelector('.tc-cat-expand');
    var catCollapseBtn = cat.querySelector('.tc-cat-collapse');
    if (catExpandBtn) catExpandBtn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      catCards.forEach(function(c){ c.open = true; });
    });
    if (catCollapseBtn) catCollapseBtn.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      catCards.forEach(function(c){ c.open = false; });
    });
  });

  applyFilter();

  Array.prototype.slice.call(document.querySelectorAll('.hop')).forEach(function(hop){
    var panel = hop.querySelector('.hop-reqres-panel');
    var endpointSpan = hop.querySelector('.hop-endpoint');
    var toggle = document.createElement('a');
    toggle.href = '#';
    toggle.className = 'hop-reqres-toggle';
    toggle.textContent = 'View req & response';

    if (panel) {
      panel.classList.add('js-hidden');
      toggle.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var hidden = panel.classList.toggle('js-hidden');
        toggle.textContent = hidden ? 'View req & response' : 'Hide req & response';
      });
      endpointSpan.parentNode.insertBefore(toggle, endpointSpan.nextSibling);
      return;
    }

    var hds = Array.prototype.slice.call(hop.querySelectorAll('.hd'));
    var reqEl = hds[0];
    var resEl = hds[1];
    if (!reqEl || !resEl) return;
    reqEl.classList.add('hop-reqres', 'js-hidden');
    resEl.classList.add('hop-reqres', 'js-hidden');
    toggle.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var hidden = reqEl.classList.toggle('js-hidden');
      resEl.classList.toggle('js-hidden', hidden);
      toggle.textContent = hidden ? 'View req & response' : 'Hide req & response';
    });
    endpointSpan.parentNode.insertBefore(toggle, endpointSpan.nextSibling);
  });

  Array.prototype.slice.call(document.querySelectorAll('.tc-reqres-anchor')).forEach(function(anchor){
    var card = anchor.closest('details.tc');
    var panel = card ? card.querySelector(':scope > .tc-reqres-panel') : null;
    if (!panel) return;
    panel.classList.add('js-hidden');
    var toggle = document.createElement('a');
    toggle.href = '#';
    toggle.className = 'hop-reqres-toggle tc-reqres-toggle';
    toggle.textContent = 'View req & response';
    toggle.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var hidden = panel.classList.toggle('js-hidden');
      toggle.textContent = hidden ? 'View req & response' : 'Hide req & response';
    });
    anchor.parentNode.insertBefore(toggle, anchor.nextSibling);
  });
})();
