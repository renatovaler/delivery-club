'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage(): JSX.Element {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: '',
    businessName: '',
    businessType: '',
    address: '',
    preferences: [],
  });

  const totalSteps = 4;

  const handleNext = (): void => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar onboarding
      handleComplete();
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (): void => {
    // Redirecionar baseado no tipo de usuário
    switch (formData.userType) {
      case 'business':
        router.push('/business/dashboard');
        break;
      case 'customer':
        router.push('/customer/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  const updateFormData = (field: string, value: any): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Bem-vindo!</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vamos configurar sua conta em alguns passos simples
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
           />
        </div>

        <div className="card">
          <div className="card-content">
            {/* Step 1: Tipo de Usuário */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Qual é o seu perfil?</h3>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="userType"
                      value="customer"
                      checked={formData.userType === 'customer'}
                      onChange={(e) => updateFormData('userType', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Cliente</div>
                      <div className="text-sm text-gray-500">Quero receber produtos e serviços</div>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="userType"
                      value="business"
                      checked={formData.userType === 'business'}
                      onChange={(e) => updateFormData('userType', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Empresa</div>
                      <div className="text-sm text-gray-500">
                        Quero oferecer produtos e serviços
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Informações da Empresa (se business) */}
            {currentStep === 2 && formData.userType === 'business' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações da Empresa</h3>
                <div>
                  <label className="label" htmlFor="businessName">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    className="input"
                    value={formData.businessName}
                    onChange={(e) => updateFormData('businessName', e.target.value)}
                    placeholder="Digite o nome da sua empresa"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="businessType">
                    Tipo de Negócio
                  </label>
                  <select
                    id="businessType"
                    className="input"
                    value={formData.businessType}
                    onChange={(e) => updateFormData('businessType', e.target.value)}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="restaurant">Restaurante</option>
                    <option value="grocery">Mercado/Hortifruti</option>
                    <option value="pharmacy">Farmácia</option>
                    <option value="bakery">Padaria</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Preferências (se customer) */}
            {currentStep === 2 && formData.userType === 'customer' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suas Preferências</h3>
                <p className="text-sm text-gray-600">
                  Selecione os tipos de produtos que mais te interessam:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Frutas e Verduras',
                    'Carnes',
                    'Laticínios',
                    'Padaria',
                    'Bebidas',
                    'Limpeza',
                  ].map((item) => (
                    <label key={item} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => {
                          const prefs = formData.preferences || [];
                          if (e.target.checked) {
                            updateFormData('preferences', [...prefs, item]);
                          } else {
                            updateFormData(
                              'preferences',
                              prefs.filter((p) => p !== item)
                            );
                          }
                        }}
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Endereço */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {formData.userType === 'business' ? 'Endereço da Empresa' : 'Seu Endereço'}
                </h3>
                <div>
                  <label className="label" htmlFor="address">
                    Endereço Completo
                  </label>
                  <textarea
                    id="address"
                    className="input min-h-[100px]"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="Digite seu endereço completo"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmação */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quase pronto!</h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium">Resumo das suas informações:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <strong>Perfil:</strong>{' '}
                      {formData.userType === 'business' ? 'Empresa' : 'Cliente'}
                    </li>
                    {formData.businessName && (
                      <li>
                        <strong>Empresa:</strong> {formData.businessName}
                      </li>
                    )}
                    {formData.businessType && (
                      <li>
                        <strong>Tipo:</strong> {formData.businessType}
                      </li>
                    )}
                    {formData.address && (
                      <li>
                        <strong>Endereço:</strong> {formData.address}
                      </li>
                    )}
                  </ul>
                </div>
                <p className="text-sm text-gray-600">
                  Clique em 'Finalizar' para completar a configuração da sua conta.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.userType) ||
                  (currentStep === 2 &&
                    formData.userType === 'business' &&
                    (!formData.businessName || !formData.businessType)) ||
                  (currentStep === 3 && !formData.address)
                }
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Passo {currentStep} de {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
}
