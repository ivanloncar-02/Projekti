#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#define MAX_NAME (64)

struct Node;
typedef struct Node node;
typedef node* position;

struct Node {
	float num;
	position next;
};

position AllocateNode();
void InsertAfter(position what, position where);
void DeleteList(position p);
int FileToBuffer(char* infixText);
int BufferToResult(position p, char* infixText);
float Operation(char op, position head);
int Push(float result, position p);
float Pop(position p);
int isOperator(char readChar);

int main() {
	node head;
	char* postfixText = NULL;

	head.next = NULL;
	head.num = 0;

	postfixText = (char*)malloc(100 * sizeof(char));
	if (postfixText == NULL) {
		DeleteList(&head);
		puts("EXIT_FAILURE - postfixText allocation error");
		return EXIT_FAILURE;
	}

	if (FileToBuffer(postfixText)) {
		DeleteList(&head);
		puts("Exiting application!");
		return EXIT_FAILURE;
	}

	if (BufferToResult(&head, postfixText)) {
		DeleteList(&head);
		puts("Exiting application!");
		return EXIT_FAILURE;
	}

	printf("\t %s \n", postfixText);

	DeleteList(&head);

	return EXIT_SUCCESS;
}

position AllocateNode() {
	return (position)malloc(sizeof(node));
}

void InsertAfter(position what, position where) {
	what->next = where->next;
	where->next = what;
}

void DeleteList(position p) {
	position temp = NULL;

	while (p->next != NULL) {
		temp = p->next;
		p->next = temp->next;
		free(temp);
	}
}

int FileToBuffer(char* postfixText) {
	FILE* fp = NULL;
	char fileName[MAX_NAME] = { "a.txt" };
	char buffer[100];

	fp = fopen(fileName, "r");
	if (NULL == fp) {
		puts("File did not open!");
		return EXIT_FAILURE;
	}

	fgets(buffer, 100, fp);
	strcpy(postfixText, buffer);

	fclose(fp);
	return EXIT_SUCCESS;
}

int BufferToResult(position p, char* postfixText) {
	int counter = 0;
	int numOfChars = 0;
	int textLength = 0;
	float result = 0;
	float readNum = 0;
	char readChar;

	textLength = (unsigned)strlen(postfixText);

	while (counter != textLength) {
		sscanf(postfixText, "%c %n", &readChar, &numOfChars);
		if (isOperator(readChar)) {
			result = Operation(readChar, p);
			if (Push(result, p)) {
				puts("Push failure in BufferToResult!");
				return EXIT_FAILURE;
			}
			postfixText += numOfChars;
			counter += numOfChars;
		}
		else {
			sscanf(postfixText, "%f %n", &readNum, &numOfChars);
			Push(readNum, p);
			postfixText += numOfChars;
			counter += numOfChars;
		}
	}
	printf("\n\tFinal result: %lf\n", result);
	return EXIT_SUCCESS;
}

float Operation(char op, position p) {
	float desni, lijevi;

	desni = Pop(p);
	lijevi = Pop(p);

	switch (op)
	{
	case '+':
		return lijevi + desni;
	case '-':
		return lijevi - desni;
	case '*':
		return lijevi * desni;
	case '/':
		return lijevi / desni;
	}
}

int Push(float result, position p) {
	position ne = NULL;

	ne = AllocateNode();
	if (NULL == ne) {
		puts("Push allocation error!");
		return EXIT_FAILURE;
	}
	ne->num = result;
	InsertAfter(ne, p);

	return EXIT_SUCCESS;
}

float Pop(position p) {
	position temp = NULL;
	float number = p->next->num;

	temp = p->next;
	p->next = p->next->next;
	free(temp);

	return number;
}

int isOperator(char readChar) {
	if (readChar == '+') return 1;
	if (readChar == '-') return 1;
	if (readChar == '*') return 1;
	if (readChar == '/') return 1;
	return 0;
}