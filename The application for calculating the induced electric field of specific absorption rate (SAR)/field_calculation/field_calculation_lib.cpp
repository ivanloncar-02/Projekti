#include "field_calculation_lib.h"
#include <cmath>
#include <complex>
#include <iostream>

const double PI = 3.14159265358979323846;
const double MU = 4 * PI * 1e-7;  // Permeability of vacuum (H/m)
double e = 2.718281828459045; // Euler's number

// Function to initialize the tissue model with specific properties
TissueModel initializeModel() {
    TissueModel model;

    model.skin.thickness = 0.002;    // 2 mm
    model.skin.permittivity = 50.0;
    model.skin.conductivity = 0.01;   // S/m
    model.skin.density = 1200;       // kg/m³

    model.fat.thickness = 0.01;      // 10 mm
    model.fat.permittivity = 5.0;
    model.fat.conductivity = 0.1;    // S/m
    model.fat.density = 900;         // kg/m³

    model.muscle.thickness = 0.03;   // 30 mm
    model.muscle.permittivity = 60.0;
    model.muscle.conductivity = 1.5; // S/m
    model.muscle.density = 1100;     // kg/m³

    return model;
}

// Function to calculate the propagation constant for a given tissue and frequency
std::complex<double> calculatePropagationConstant(const TissueProperties& tissue, double frequency) {
    double omega = 2 * PI * frequency;
    double epsilon = tissue.permittivity * 8.854187817e-12;  // Permittivity of tissue (F/m)
    std::cout<<"Epsilon:" << epsilon<<"\n";
    double sigma = tissue.conductivity;

    // Calculate the complex argument of the square root
    std::complex<double> complexArgument = std::complex<double>(0, omega * MU) * (sigma + std::complex<double>(0, omega * epsilon));

    // Calculate the propagation constant (gamma)
    std::complex<double> gamma = sqrt(complexArgument);

    return gamma;
}

// Function to calculate the characteristic impedance for a given tissue and frequency
std::complex<double> calculateCharacteristicImpedance(const TissueProperties& tissue, double frequency) {
    double omega = 2 * PI * frequency;

    // Calculate the propagation constant
    std::complex<double> gamma = calculatePropagationConstant(tissue, frequency);

    // Calculate the characteristic impedance
    std::complex<double> j(0, 1);  // j is the imaginary unit
    std::complex<double> Zc = (j * omega * MU) / gamma;

    return Zc;
}

// Function to calculate the reflection coefficient between two impedances
std::complex<double> calculateReflectionCoefficient(const std::complex<double>& Z1, const std::complex<double>& Z2) {
    return (Z2 - Z1) / (Z2 + Z1);
}

// Function to calculate the transmission coefficient between two impedances
std::complex<double> calculateTransmissionCoefficient(const std::complex<double>& Z1, const std::complex<double>& Z2) {
    return 2.0 * Z2 / (Z2 + Z1);
}

// Function to perform matrix multiplication for 2x2 matrices
void multiplyMatrices(const std::complex<double> A[2][2], const std::complex<double> B[2][2], std::complex<double> result[2][2]) {
    for (int i = 0; i < 2; ++i) {
        for (int j = 0; j < 2; ++j) {
            result[i][j] = 0;
            for (int k = 0; k < 2; ++k) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

void inverseMatrices(const std::complex<double> M[2][2], std::complex<double> result[2][2]) {
    std::complex<double> a = M[0][0];
    std::complex<double> b = M[0][1];
    std::complex<double> c = M[1][0];
    std::complex<double> d = M[1][1];

    // Calculate the determinant
    std::complex<double> det = a * d - b * c;

    // Check if the determinant is zero (singular matrix)
    if (det == std::complex<double>(0, 0)) {
        throw std::runtime_error("Matrix is singular and cannot be inverted.");
    }

    // Calculate the inverse matrix
    result[0][0] = d / det;
    result[0][1] = -b / det;
    result[1][0] = -c / det;
    result[1][1] = a / det;
}

void calculateElectricField(std::complex<double> electricField1, std::complex<double> electricField2,
    std::complex<double>& electricField3, std::complex<double>& electricField4, std::complex<double>& electricField5,
    std::complex<double>& electricField6, std::complex<double> R, std::complex<double> gamma, double l, std::complex<double> T) {

    std::complex<double> scalarT = 1.0 / T;
    std::complex<double> M1[2][2] = { {1.0, R}, {R, 1.0} };
    std::complex<double> M2[2][2] = { {std::pow(e, gamma * l), 0}, {0, std::pow(e, -gamma * l)} };
    std::complex<double> ResultMatrix[2][2];
    for (int i = 0; i < 2; ++i) {
        for (int j = 0; j < 2; ++j) {
            M1[i][j] *=T;
        }
    }
    inverseMatrices(M1, ResultMatrix);
    electricField3 = (ResultMatrix[0][0] * electricField1) + (ResultMatrix[0][1]* electricField2);
    electricField4 = (ResultMatrix[1][0] * electricField1) + (ResultMatrix[1][1] * electricField2);
 
    inverseMatrices(M2, ResultMatrix);
    electricField5= (ResultMatrix[0][0] * electricField1) + (ResultMatrix[0][1] * electricField2);
    electricField6 = (ResultMatrix[1][0] * electricField1) + (ResultMatrix[1][1] * electricField2);
}

void calculatePropagationMatrices(std::complex<double> electricField1, std::complex<double> electricField2,
    std::complex<double>& electricFieldResult, std::complex<double> gamma, double z) {

    if (electricField2.real()==0.0 && electricField2.imag() == 0.0) {
        electricFieldResult = electricField1 * pow(e, -gamma * z);
    }
    else {
        electricFieldResult = (electricField1 * pow(e, -gamma * z)) + electricField2 * pow(e, gamma * z); 
    }

}
// Function to calculate the electric field with given inputs
FieldResults calculateElectricFieldWithInput(std::complex<double> electricField,
    std::complex<double> R1, std::complex<double> R2, std::complex<double> R3,
    std::complex<double> gamma1, std::complex<double> gamma2, std::complex<double> gamma3, double l1, double l2, double l3,
    std::complex<double> T1, std::complex<double> T2, std::complex<double> T3) {

    double e = 2.718281828459045; // Euler's number
    std::complex<double> E1P, E1N, E3Pp, E1Pp, E1Np, E2P, E2N, E2Pp, E2Np, E3P, E3N;

    std::complex<double> M1[2][2] = { {1.0, R1}, {R1, 1.0} };
    std::complex<double> M2[2][2] = { {std::pow(e, gamma1 * l1), 0}, {0, std::pow(e, -gamma1 * l1)} };
    std::complex<double> M3[2][2] = { {1.0, R2}, {R2, 1.0} };
    std::complex<double> M4[2][2] = { {std::pow(e, gamma2 * l2), 0}, {0, std::pow(e, -gamma2 * l2)} };
    std::complex<double> M5[2][2] = { {1.0, R3}, {R3, 1.0} };

    std::complex<double> I1[2][1] = { {electricField}, {E1N} };
    std::complex<double> I2[2][1] = { {E3Pp}, {0} };

    std::complex<double> intermediate1[2][2];
    std::complex<double> intermediate2[2][2];
    std::complex<double> intermediate3[2][2];
    std::complex<double> resultMatrix[2][2];

    // Perform matrix multiplications
    multiplyMatrices(M1, M2, intermediate1);
    multiplyMatrices(intermediate1, M3, intermediate2);
    multiplyMatrices(intermediate2, M4, intermediate3);
    multiplyMatrices(intermediate3, M5, resultMatrix);
 
    // Apply scalar multipliers
    std::complex<double> scalarT1 = 1.0 / T1;
    std::complex<double> scalarT2 = 1.0 / T2;
    std::complex<double> scalarT3 = 1.0 / T3;
    std::complex<double> inverseMatrix[2][2];
   
    // Apply scalar multipliers to the result matrix
    for (int i = 0; i < 2; ++i) {
        for (int j = 0; j < 2; ++j) {
            resultMatrix[i][j] *= scalarT1 * scalarT2 * scalarT3;
        }
    }
    inverseMatrices(resultMatrix, inverseMatrix);
    E1N = -(inverseMatrix[1][0] * electricField) / inverseMatrix[1][1];
    E3Pp = (inverseMatrix[0][0] * electricField) + (inverseMatrix[0][1]* E1N);
    // Print the results
    E1P = electricField;

    std::cout << "E1+:" << E1P << std::endl;
    std::cout << "E1-:" <<E1N<< "\n" << std::endl;
 
    calculateElectricField(E1P, E1N, E1Pp, E1Np,E2P,E2N,R1 ,gamma1 ,l1 ,T1);
    std::cout << "E1+':" << E1Pp << std::endl;
    std::cout << "E1-':" << E1Np << "\n" << std::endl;
    std::cout << "E2+:" << E2P << std::endl;
    std::cout << "E2-:" << E2N << "\n" << std::endl;
    calculateElectricField(E2P, E2N, E2Pp, E2Np,E3P, E3N, R2, gamma2, l2, T3);
    std::cout << "E2+':" << E2Pp << std::endl;
    std::cout << "E2-':" << E2Np << "\n" << std::endl;
    std::cout << "E3+:" << E3P << std::endl;
    std::cout << "E3-:" << E3N << "\n" << std::endl;

    std::cout << "E3+:" << E3Pp << "\n" << std::endl;

    std::complex<double> E1,E2,E3;
    std::complex<double> E3Np(0.0,0.0);//chosen value because muscle thickness is considered infinite

    calculatePropagationMatrices(E1Pp, E1Np, E1, gamma1, l1);
    std::cout << "E1 propagation:" << E1 << "\n" << std::endl;
    calculatePropagationMatrices(E2Pp, E2Np, E2, gamma2, l2);
    std::cout << "E2 propagation:" << E2 << "\n" << std::endl;
    calculatePropagationMatrices(E3Pp, E3Np, E3, gamma3, l3);
    std::cout << "E3 propagation:" << E3 << "\n" << std::endl;

    FieldResults returnResult;
    returnResult.E1 = E1;
    returnResult.E2 = E2;
    returnResult.E3 = E3;

    return returnResult;
}

