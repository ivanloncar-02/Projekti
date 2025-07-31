#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAX_NAME (64)
#define _ERROR (NULL)

struct Poly;
typedef struct Poly poly;
typedef poly* position;

struct Poly {
	int coef;
	int expo;
	position next;
};

position AllocateNode();
void InsertAfter(position what, position where);
int FileToList(position p, char* fileName);
void DeleteList(position p);
void DeleteAll(position p, position q, position sum, position prod);
int PrintList(position p);
int SumPoly(position p, position q, position sum);
int ProdPoly(position p, position q, position prod);
int InsertSorted(position temp, position p);


int main() {
	//deklaracija
	int isError;
	int isAppRunning;
	int menuChoice;
	poly l1, l2, sum, prod;


	//inicijalizacija
	isError = 0;
	isAppRunning = 1;
	menuChoice = 0;

	l1.next = NULL;
	l1.coef = 0;
	l1.expo = 0;

	l2.next = NULL;
	l2.coef = 0;
	l2.expo = 0;

	sum.next = NULL;
	sum.coef = 0;
	sum.expo = 0;

	prod.next = NULL;
	prod.coef = 0;
	prod.expo = 0;

	isError = FileToList(&l1, "poly1.txt");
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}
	isError = FileToList(&l2, "poly2.txt");
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}

	isError = SumPoly(&l1, &l2, &sum);
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}
	isError = ProdPoly(l1.next, l2.next, &prod);
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}

	puts("First list:");
	isError = PrintList(l1.next);
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}
	puts("Second list:");
	isError = PrintList(l2.next);
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}
	puts("Sum list:");
	isError = PrintList(sum.next);
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}
	puts("Product list:");
	isError = PrintList(prod.next);
	if (isError) {
		DeleteAll(&l1, &l2, &sum, &prod);
		puts("Exiting program!");
		return EXIT_FAILURE;
	}

	DeleteAll(&l1, &l2, &sum, &prod);
	return EXIT_SUCCESS;
}

position AllocateNode() {
	return (position)malloc(sizeof(poly));
}

void InsertAfter(position what, position where) {
	what->next = where->next;
	where->next = what;
}

int FileToList(position p, char* fileName) {
	FILE* fp = NULL;
	position temp = NULL;
	position start = NULL;

	fp = fopen(fileName, "r");
	if (NULL == fp) {
		puts("File did not open!");
		return EXIT_FAILURE;
	}

	while (!feof(fp)) {
		temp = AllocateNode();
		if (NULL == temp) {
			puts("Allocation failed!");
			return EXIT_FAILURE;
		}
		fscanf(fp, "%d %d", &temp->coef, &temp->expo);
		temp->next = NULL;
		InsertSorted(temp, p);

	}

	fclose(fp);
	return EXIT_SUCCESS;
}

void DeleteList(position p) {
	position temp = NULL;

	while (p->next != NULL) {
		temp = p->next;
		p->next = temp->next;
		free(temp);
	}
}

int PrintList(position p) {
	if (NULL == p) {
		puts("Error - list is empty");
		return EXIT_SUCCESS;
	}

	while (p != NULL) {
		printf("\n\t%d * x^(%d)", p->coef, p->expo);
		p = p->next;
	}
	puts("");

	return EXIT_SUCCESS;
}

int InsertSorted(position temp, position p) {
	if (NULL == temp) {
		puts("InsertSorted allocation failed!");
		return EXIT_FAILURE;
	}

	while (p->next != NULL && temp->expo < p->next->expo) {
		p = p->next;
	}

	if (NULL == p->next) {
		InsertAfter(temp, p);
		return EXIT_SUCCESS;
	}

	if (p->next->expo < temp->expo) {
		InsertAfter(temp, p);
		return EXIT_SUCCESS;
	}
	return EXIT_FAILURE;
}

int SumPoly(position p, position q, position sum) {
	position temp = NULL;
	while (NULL != p->next && NULL != q->next) {
		if (p->next->expo == q->next->expo) {

			temp = AllocateNode();
			if (NULL == temp) {
				puts("Allocation error");
				return EXIT_FAILURE;
			}
			temp->coef = p->next->coef + q->next->coef;
			temp->expo = p->next->expo;
			temp->next = NULL;
			InsertAfter(temp, sum);

			p = p->next;
			q = q->next;
			sum = sum->next;
		}
		else if (p->next->expo > q->next->expo) {

			temp = AllocateNode();
			if (NULL == temp) {
				puts("Allocation error");
				return EXIT_FAILURE;
			}
			temp->coef = p->next->coef;
			temp->expo = p->next->expo;
			temp->next = NULL;
			InsertAfter(temp, sum);

			p = p->next;
			sum = sum->next;
		}
		else if (p->next->expo < q->next->expo) {

			temp = AllocateNode();
			if (NULL == temp) {
				puts("Allocation error");
				return EXIT_FAILURE;
			}
			temp->coef = q->next->coef;
			temp->expo = q->next->expo;
			temp->next = NULL;
			InsertAfter(temp, sum);

			q = q->next;
			sum = sum->next;
		}

	};
	return EXIT_SUCCESS;
}

int ProdPoly(position p, position q, position prod) {
	position temp = NULL; //za alociranje novog elementa
	position bookmark = NULL; // za vracanje produkt liste na pocetak
	position Q = NULL; // za iteriranje pojedine liste
	position P = NULL; // za iteriranje pojedine liste

	bookmark = prod; // postavljanje bookmark pokazivaca na pocetak prod liste

	P = p;
	while (P != NULL) {
		Q = q;
		while (Q != NULL) {
			temp = AllocateNode();
			if (NULL == temp) {
				puts("ProdPoly() allocation error!");
				return EXIT_FAILURE;
			}
			temp->next = NULL;
			temp->expo = P->expo + Q->expo;
			temp->coef = P->coef * Q->coef;

			prod = bookmark;

			while (prod->next != NULL && prod->next->expo < temp->expo) {
				prod = prod->next;
			}
			if (NULL == prod->next) {
				InsertAfter(temp, prod);
			}
			else if (prod->next->expo == temp->expo) {
				prod->next->coef += temp->coef;
				free(temp);
			}
			else {
				InsertAfter(temp, prod);
			}
			Q = Q->next;
		}
		P = P->next;
	}



	return EXIT_SUCCESS;
}

void DeleteAll(position p, position q, position sum, position prod) {
	DeleteList(p);
	DeleteList(q);
	DeleteList(sum);
	DeleteList(prod);
}