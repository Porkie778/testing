

window.addEventListener('load', () => {
	document.getElementsByClassName('loader')[0].classList.add('loader-hidden');
	document.getElementsByClassName('loader')[0].addEventListener('transitionend', () => {
		document.body.removeChild('loader');
	});
});

// Open navigation menu sidebar
function openNav() {
	document.getElementById('mobile-nav').style.width = '250px';
	document.body.style.overflow = 'hidden';
}

/* Set the width of the side navigation to 0 */
function closeNav() {
	document.getElementById('mobile-nav').style.width = '0';
	document.body.style.overflow = 'scroll';
};
