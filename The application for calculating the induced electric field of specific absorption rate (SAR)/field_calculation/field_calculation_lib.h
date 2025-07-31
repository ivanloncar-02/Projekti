#ifndef FIELD_CALCULATION_LIB_H
#define FIELD_CALCULATION_LIB_H
#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif
#include <complex>

// Define constants
const double Z_AIR = 377;  // Characteristic impedance of air (Ohms)

// Structure for tissue properties
struct TissueProperties {
    double thickness;      // Thickness of layer (m)
    double permittivity;   // Relative permittivity
    double conductivity;   // Electrical conductivity (S/m)
    double density;        // Density of tissue (kg/m³)
};

// Structure for tissue model
struct TissueModel {
    TissueProperties skin;
    TissueProperties fat;
    TissueProperties muscle;
};
struct FieldResults {
    std::complex<double> E1;
    std::complex<double> E2;
    std::complex<double> E3;
};

// Function declarations
TissueModel initializeModel();
std::complex<double> calculatePropagationConstant(const TissueProperties& tissue, double frequency);
std::complex<double> calculateCharacteristicImpedance(const TissueProperties& tissue, double frequency);
std::complex<double> calculateReflectionCoefficient(const std::complex<double>& Z1, const std::complex<double>& Z2);
std::complex<double> calculateTransmissionCoefficient(const std::complex<double>& Z1, const std::complex<double>& Z2);

// Function to calculate electric field with input parameters
FieldResults calculateElectricFieldWithInput(std::complex<double> electricField,
    std::complex<double> R1, std::complex<double> R2, std::complex<double> R3,
    std::complex<double> gamma1, std::complex<double> gamma2, std::complex<double> gamma3, double l1, double l2,double l3,
    std::complex<double> T1, std::complex<double> T2, std::complex<double> T3);

void calculateElectricField(std::complex<double> electricField1, std::complex<double> electricField2,
    std::complex<double>& electricField3, std::complex<double>& electricField5, std::complex<double>& electricField6,
    std::complex<double> R, std::complex<double> gamma, double l, std::complex<double> T);

void calculatePropagationMatrices(std::complex<double> electricField1, std::complex<double> electricField2,
    std::complex<double>& electricFieldResult, std::complex<double> gamma, double l);

extern "C" {
    EXPORT void CalculateFields(double frequency, double skinThickness, double fatThickness, double muscleThickness,
        double* E1_real, double* E1_imag, double* E2_real, double* E2_imag, double* E3_real, double* E3_imag);
}
#endif // FIELD_CALCULATION_LIB_H
