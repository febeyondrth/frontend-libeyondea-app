import { MutableRefObject } from 'react';

export const getPageNumbers = ({
	currentPage,
	limit,
	total,
	pageNumbersToShow = 3
}: {
	currentPage: number;
	limit: number;
	total: number;
	pageNumbersToShow?: number;
}): Array<number | null> => {
	const lastPageNumber = Math.ceil(total / limit);
	const currentPageNumber = currentPage <= lastPageNumber ? currentPage : lastPageNumber;
	const maxPagesBeforeCurrentPage = Math.floor(pageNumbersToShow / 2);
	const maxPagesAfterCurrentPage = Math.ceil(pageNumbersToShow / 2) - 1;
	let startPage = 1;
	let endPage = lastPageNumber;

	if (lastPageNumber <= 1) {
		return []; // Don't show numbers if there's only 1 page
	}

	if (currentPageNumber <= maxPagesBeforeCurrentPage) {
		// near the start
		startPage = 1;
		endPage = pageNumbersToShow;
	} else if (currentPageNumber + maxPagesAfterCurrentPage >= lastPageNumber) {
		// near the end
		startPage = lastPageNumber - pageNumbersToShow + 1;
	} else {
		// somewhere in the middle
		startPage = currentPageNumber - maxPagesBeforeCurrentPage;
		endPage = currentPageNumber + maxPagesAfterCurrentPage;
	}

	let pageNumbers: Array<number | null> = Array.from(Array(endPage + 1 - startPage).keys())
		.map((pageNumber) => startPage + pageNumber)
		.filter((pageNumber) => pageNumber <= lastPageNumber && pageNumber > 0);

	if (Number(pageNumbers[0]) > 1) {
		if (Number(pageNumbers[0]) <= 2) {
			pageNumbers = [1, ...pageNumbers];
		} else {
			const ellipsis: number | null = Number(pageNumbers[0]) > 3 ? null : 2;
			pageNumbers = [1, ellipsis, ...pageNumbers];
		}
	}

	if (pageNumbers[pageNumbers.length - 1] !== lastPageNumber) {
		if (pageNumbers[pageNumbers.length - 1] === lastPageNumber - 1) {
			pageNumbers = [...pageNumbers, lastPageNumber];
		} else {
			const ellipsis: number | null =
				Number(pageNumbers[pageNumbers.length - 1]) < lastPageNumber - 2 ? null : lastPageNumber - 1;
			pageNumbers = [...pageNumbers, ellipsis, lastPageNumber];
		}
	}

	return pageNumbers;
};

export const insertItemIntoArray = <T extends object | string | number>(arr: T[], item: T, index = 0): T[] => {
	const arrClone = [...arr];
	arrClone.splice(index, 0, item);
	return arrClone;
};

export const updateArrayItemById = <T extends { id: number }>(arr: T[], itemId: number, fields: T): T[] => {
	const arrClone = [...arr];
	const item = arrClone.find((i) => i.id === itemId);
	if (item) {
		const itemIndex = arrClone.indexOf(item);
		arrClone.splice(itemIndex, 1, { ...item, ...fields });
	}
	return arrClone;
};

export const deleteArrayItemById = <T extends { id: number }>(arr: T[], itemId: number): T[] => {
	const arrClone = [...arr];
	const item = arrClone.find((i) => i.id === itemId);
	if (item) {
		const itemIndex = arrClone.indexOf(item);
		arrClone.splice(itemIndex, 1);
	}
	return arrClone;
};

export const getOwnerDocument = <T extends Element | MutableRefObject<Element | null>>(element?: T | null): Document | null => {
	if (typeof window === 'undefined') {
		return null;
	} else if (element instanceof Node) {
		return element.ownerDocument;
	} else if (element?.hasOwnProperty('current') && element.current instanceof Node) {
		return element.current.ownerDocument;
	} else {
		return document;
	}
};