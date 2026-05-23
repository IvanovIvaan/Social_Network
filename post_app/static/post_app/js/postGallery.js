// const container = document.querySelector('.post-images');

// const images = [...container.querySelectorAll('img')];

// const containerWidth = container.clientWidth;

// const targetRowHeight = 250;
// const gap = 8;

// let currentRow = [];
// let currentAspectRatioSum = 0;

// const rows = [];

// images.forEach((img) => {

//     const aspectRatio =
//         img.naturalWidth / img.naturalHeight;

//     currentRow.push({
//         element: img,
//         aspectRatio
//     });

//     currentAspectRatioSum += aspectRatio;

//     const rowWidth =
//         currentAspectRatioSum * targetRowHeight +
//         gap * (currentRow.length - 1);

//     if (rowWidth >= containerWidth) {

//         rows.push(currentRow);

//         currentRow = [];
//         currentAspectRatioSum = 0;
//     }
// });

// if (currentRow.length) {
//     rows.push(currentRow);
// }

// container.innerHTML = '';

// rows.forEach((row) => {

//     const rowAspectRatioSum = row.reduce(
//         (sum, item) => sum + item.aspectRatio,
//         0
//     );

//     const rowHeight =
//         (containerWidth -
//             gap * (row.length - 1)) /
//         rowAspectRatioSum;

//     const rowDiv = document.createElement('div');

//     rowDiv.className = 'gallery-row';

//     row.forEach((item) => {

//         item.element.style.height =
//             `${rowHeight}px`;

//         item.element.style.width =
//             `${rowHeight * item.aspectRatio}px`;

//         rowDiv.appendChild(item.element);
//     });

//     container.appendChild(rowDiv);
// });