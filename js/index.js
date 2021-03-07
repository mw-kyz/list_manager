;(function(doc) {

	var oNav = doc.getElementsByClassName('J_nav')[0],
			oNavItems = oNav.getElementsByClassName('nav-item'),
			oSearchRow = doc.getElementsByClassName('J_searchRow')[0],
			oWarningTip = doc.getElementsByClassName('J_tipRow')[0],
			oCourseList = doc.getElementsByClassName('J_courseList')[0],
			oSearchInput = doc.getElementById('J_searchInput'),
			oPageBtnRow = doc.getElementsByClassName('J_pageBtnRow')[0],
			oPageBtnList = doc.getElementsByClassName('J_pageBtnList')[0],
			oBtnItems = oPageBtnList.getElementsByClassName('btn-item'),
			oCourseInputs = oCourseList.getElementsByClassName('course-name-input'),
			oCourseSpans = oCourseList.getElementsByClassName('course-name'),

			listItemTpl = doc.getElementById('J_listItemTpl').innerHTML,
			pageBtnItemTpl = doc.getElementById('J_pageBtnItemTpl').innerHTML,

			oNavItemsLen = oNavItems.length;

	var field = 'manage',
			pageNum = 0,
			curId = 0,
			curIdx = -1;

	var API = {
		getCourseList: 'http://localhost/api_for_study/List/getCourseListForManage',
    getSearchList: 'http://localhost/api_for_study/List/getSearchListForManage',
    doListItem: 'http://localhost/api_for_study/List/doListItemForManage',
    updateCourseName: 'http://localhost/api_for_study/List/updateCourseNameForManage'
	}

	var init = function() {
		getCourseList(field, pageNum);
		bindEvent();
	}

	function bindEvent() {
		oNav.addEventListener('click', navClick, false);
		oSearchInput.addEventListener('input', throttle(courseSearch, 800), false);
		oPageBtnList.addEventListener('click', changePage, false);
		oCourseList.addEventListener('click', listClick, false);
	}

	function navClick(e) {
		var e = e || window.event,
				tar = e.target || e.srcElement,
				className = tar.className;

		e.stopPropagation();

		if(className === 'nav-lk') {
			var oParent = tar.parentNode,
					item;

			field = oParent.getAttribute('data-field');

			for(var i = 0; i < oNavItemsLen; i++) {
				item = oNavItems[i];
				item.className = 'nav-item';
			}

			oParent.className += ' active';

			if(field === 'search') {
				showWarningTip(true);
				showSearchInput(true);
				showPageBtnRow(false);
				return;
			}
			pageNum = 0;
			showSearchInput(false);
			getCourseList(field, pageNum);
		}
	}

	function courseSearch(e) {
		var e = e || window.event,
				val = trimSpace(this.value),
				valLen = val.length;

		e.stopPropagation();

		if(valLen > 0) {
			getSearchList(val);
		}else {
			showWarningTip(true);
		}
	}

	function changePage(e) {
		var e = e || window.event,
				tar = e.target || e.srcElement,
				className = tar.className;

		e.stopPropagation();

		if(className === 'page-btn') {
			var oParent = tar.parentNode,
					pageNum = [].indexOf.call(oBtnItems, oParent),
					oBtnItemsLen = oBtnItems.length,
					item;

			for(var i = 0; i < oBtnItems.length; i++) {
				item = oBtnItems[i];
				item.className = 'btn-item';
			}
			oParent.className += ' cur';
			getCourseList(field, pageNum);
		}
	}

	function listClick(e) {
		var e = e || window.event,
				tar = e.target || e.srcElement,
				className = tar.className,
				itemId = tar.getAttribute('data-id');
		
		e.stopPropagation();

		switch(className) {
			case 'list-btn delete':
				var c = confirm('确认删除');
				c && doListItem('remove', pageNum, itemId);
				break;
			case 'list-btn regain':
				var c = confirm('确认恢复');
				c && doListItem('regain', pageNum, itemId);
				break;
			case 'course-name':
				showInput(tar);
				break;
		}

	}

	function updateCourseName(e) {
		var e = e || window.event,
				eventType = e.type;

		if(eventType === 'keyup') {
			var keyCode = e.keyCode;

			if(keyCode === 13) {
				submitNewCourseName(curId, curIdx);
			}
			return;
		}
		submitNewCourseName(curId, curIdx);
	}

	function getCourseList(field, pageNum) {
		xhr.ajax({
			url: API.getCourseList,
			type: 'POST',
			dataType: 'JSON',
			data: {
				field: field,
				pageNum: pageNum
			},
			success: function(data) {
				var res = data.res,
						pageCount = data.pages;
						console.log(data);
				_setDatas(field, res, pageCount, pageNum);
			},
			error: function() {
				alert('列表获取失败，请重试！');
			}
		});
	}

	function getSearchList(keyword) {
		xhr.ajax({
			url: API.getSearchList,
			type: 'POST',
			dataType: 'JSON',
			data: {
				keyword: keyword
			},
			success: function(data) {
				var res = data.res;

				_setDatas('manage', res);
			},
			error: function() {
				alert('搜索操作失败，请重试！');
			}
		});
	}

	function submitNewCourseName(curId, curIdx) {
		hideAllInputs();

		var newVal = oCourseInputs[curIdx].value,
				thisCourseSpan = oCourseSpans[curIdx];

		if(newVal === thisCourseSpan.innerHTML) {
			return;
		}

		xhr.ajax({
			url: API.updateCourseName,
			type: 'POST',
			dataType: 'JSON',
			data: {
				itemId: curId,
				newVal: newVal
			},
			success: function(data) {
				if(data === 'success') {
					thisCourseSpan.innerHTML = newVal;
				}else {
					alert('更改课程名称失败，请重试！');
				}

				curId = 0;
				curIdx = -1;
			},
			error: function() {
				alert('更改课程名称失败，请重试！');
			}

		});
	}

	function doListItem(type, pageNum, itemId) {
		xhr.ajax({
			url: API.doListItem,
			type: 'POST',
			dataType: 'JSON',
			data: {
				type: type,
				pageNum: pageNum,
				itemId: itemId
			},
			success: function(data) {
				var res = data.res,
						pageCount = data.pages;

				_setDatas(field, res, pageCount, pageNum);
			},
			error: function() {
				alert('操作列表失败，请重试！');
			}
		});
	}

	function _setDatas(field, data, pageCount, pageNum) {
		if(data && data.length > 0) {
			oCourseList.innerHTML = renderList(field, data);
			showWarningTip(false);

			if(pageCount > 1 && field !== 'search') {
				oPageBtnList.innerHTML = renderPageBtns(pageCount, pageNum);
				showPageBtnRow(true);
			}else {
				showPageBtnRow(false);
			}
		}else {
			showWarningTip(true);
		}
	}

	function showWarningTip(show) {
		if(show) {
			oWarningTip.className = 'tip-row J_tipRow';
			oCourseList.innerHTML = '';
		}else {
			oWarningTip.className  += ' hide';
		}
	}

	function showSearchInput(show) {
		if(show) {
			oSearchInput.value = '';
			oSearchRow.className += ' show'; 
		}else {
			oSearchRow.className = 'search-row J_searchRow';
		}
	}

	function showPageBtnRow(show) {
		if(show) {
			oPageBtnRow.className += ' show';
		}else {
			oPageBtnList.innerHTML = '';
			oPageBtnRow.className = 'page-btn-row J_pageBtnRow';
		}
	}

	function showInput(target) {
		hideAllInputs();
		var oParent = target.parentNode,
				thisInput = oParent.getElementsByClassName('course-name-input')[0],
				thisInputLen = thisInput.value.length;
		
		curId = thisInput.getAttribute('data-id');
		curIdx = [].indexOf.call(oCourseInputs, thisInput);

		thisInput.className += ' show';
		thisInput.focus();
		thisInput.setSelectionRange(0, thisInputLen);

		document.addEventListener('click', updateCourseName, false);
		document.addEventListener('keyup', updateCourseName, false);
	}

	function hideAllInputs() {
		var inputLen = oCourseInputs.length,
				item;

		for(var i = 0; i < inputLen; i++) {
			item = oCourseInputs[i];
			item.className = 'course-name-input';
			item.blur();
		}

		document.removeEventListener('click', updateCourseName, false);
		document.removeEventListener('keyup', updateCourseName, false);
	}

	function renderList(listField, data) {
		var list = '';
		data.forEach(function(elem) {
			list += listItemTpl.replace(/{{(.*?)}}/g, function(node, key) {
				return {
					id: elem.id,
					course: elem.course,
					hour: elem.hour,
					teacher: elem.teacher,
					field: elem.field,
					type: listField == 'trash' ? 'regain' : 'delete',
					typeText: listField == 'trash' ? '恢复' : '删除'
				}[key];
			})
		});

		return list;
	}

	function renderPageBtns(pageCount, pageNum) {
		var list = '';

		for(var i = 0; i < pageCount; i++) {
			list += pageBtnItemTpl.replace(/{{(.*?)}}/g, function(node, key) {
				return {
					pageNum: i + 1,
					isCur: i == pageNum && 'cur'
				}[key];
			});
		}

		return list;
	}

	init();

})(document);