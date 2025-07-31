#include "field_calculation_lib.h"
#include <iostream>
#include <complex>

#ifdef _WIN32
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

extern "C" {
    EXPORT void CalculateFields(double frequency, double skinThickness, double fatThickness, double muscleThickness,
        double* E1_real, double* E1_imag, double* E2_real, double* E2_imag, double* E3_real, double* E3_imag) {

        // Initialize tissue model with the input thicknesses
        TissueModel model = initializeModel();
        model.skin.thickness = skinThickness;
        model.fat.thickness = fatThickness;
        model.muscle.thickness = muscleThickness;

        // Conductivity (sigma) and mass density (rho) for each layer
        double sigma_skin = model.skin.conductivity;    // S/m
        double rho_skin = model.skin.density;          // kg/m³
        double sigma_fat = model.fat.conductivity;     // S/m
        double rho_fat = model.fat.density;            // kg/m³
        double sigma_muscle = model.muscle.conductivity; // S/m
        double rho_muscle = model.muscle.density;      // kg/m³

        // Perform calculations (as in your original code)
        std::complex<double> Z_air(Z_AIR, 0);
        std::complex<double> Z_skin = calculateCharacteristicImpedance(model.skin, frequency);
        std::complex<double> Z_fat = calculateCharacteristicImpedance(model.fat, frequency);
        std::complex<double> Z_muscle = calculateCharacteristicImpedance(model.muscle, frequency);

        std::complex<double> gamma_skin = calculatePropagationConstant(model.skin, frequency);
        std::complex<double> gamma_fat = calculatePropagationConstant(model.fat, frequency);
        std::complex<double> gamma_muscle = calculatePropagationConstant(model.muscle, frequency);

        std::complex<double> R_air_skin = calculateReflectionCoefficient(Z_air, Z_skin);
        std::complex<double> T_air_skin = calculateTransmissionCoefficient(Z_air, Z_skin);

        std::complex<double> R_skin_fat = calculateReflectionCoefficient(Z_skin, Z_fat);
        std::complex<double> T_skin_fat = calculateTransmissionCoefficient(Z_skin, Z_fat);

        std::complex<double> R_fat_muscle = calculateReflectionCoefficient(Z_fat, Z_muscle);
        std::complex<double> T_fat_muscle = calculateTransmissionCoefficient(Z_fat, Z_muscle);

        std::complex<double> electricField = 1.0;

        FieldResults results = calculateElectricFieldWithInput(
            electricField, R_air_skin, R_skin_fat, R_fat_muscle,
            gamma_skin, gamma_fat, gamma_muscle,
            model.skin.thickness, model.fat.thickness, model.muscle.thickness,
            T_air_skin, T_skin_fat, T_fat_muscle);

        // Convert results to real and imaginary parts and store in output parameters
        *E1_real = results.E1.real();
        *E1_imag = results.E1.imag();
        *E2_real = results.E2.real();
        *E2_imag = results.E2.imag();
        *E3_real = results.E3.real();
        *E3_imag = results.E3.imag();

        // Calculate the electric field magnitude for each layer
        double E1_magnitude = std::abs(results.E1);
        double E2_magnitude = std::abs(results.E2);
        double E3_magnitude = std::abs(results.E3);

        // Calculate SAR for each layer
        double SAR_skin = (sigma_skin * E1_magnitude * E1_magnitude) / rho_skin;
        double SAR_fat = (sigma_fat * E2_magnitude * E2_magnitude) / rho_fat;
        double SAR_muscle = (sigma_muscle * E3_magnitude * E3_magnitude) / rho_muscle;

        // Output SAR results
        std::cout << "\nSAR (Skin): " << SAR_skin << " W/kg";
        std::cout << "\nSAR (Fat): " << SAR_fat << " W/kg";
        std::cout << "\nSAR (Muscle): " << SAR_muscle << " W/kg";

        // Output electric field results to the console
        std::cout << "\nE1_real: " << *E1_real;
        std::cout << "\nE1_imag: " << *E1_imag;
        std::cout << "\nE2_real: " << *E2_real;
        std::cout << "\nE2_imag: " << *E2_imag;
        std::cout << "\nE3_real: " << *E3_real;
        std::cout << "\nE3_imag: " << *E3_imag;
    }
}

int main() {
    //// Initialize input values
    //double frequency = 3e9;          // Frequency in Hz (3 GHz)
    //double skinThickness = 0.002;    // Skin thickness in meters (2 mm)
    //double fatThickness = 0.01;      // Fat thickness in meters (10 mm)
    //double muscleThickness = 0.03;   // Muscle thickness in meters (30 mm)

    //// Initialize variables to hold the results of electric field components
    //double E1_real, E1_imag, E2_real, E2_imag, E3_real, E3_imag;

    //// Call CalculateFields with the addresses of the result variables
    //CalculateFields(frequency, skinThickness, fatThickness, muscleThickness,
    //    &E1_real, &E1_imag, &E2_real, &E2_imag, &E3_real, &E3_imag);

    //// The SAR calculations and field output are already done in CalculateFields.
    //// Therefore, no additional code is needed here unless further processing is required.

    return 0;
}