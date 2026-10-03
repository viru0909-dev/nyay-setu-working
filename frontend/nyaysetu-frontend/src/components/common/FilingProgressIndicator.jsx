import { CheckCircle2 } from 'lucide-react';

export default function FilingProgressIndicator({ steps, currentStep, onStepSelect }) {
    const totalSteps = steps.length;
    const completionPercent = Math.round((currentStep / totalSteps) * 100);
    const connectorPercent = totalSteps > 1
        ? ((currentStep - 1) / (totalSteps - 1)) * 100
        : 100;

    return (
        <section
            className="case-progress-wrapper"
            aria-label="Case filing progress"
        >
            <div className="case-progress-header">
                <div className="case-progress-info">
                    <span className="case-progress-step-label">
                        Step <strong>{currentStep}</strong> of <strong>{totalSteps}</strong>
                    </span>
                    <span className="case-progress-percentage">
                        {completionPercent}% complete
                    </span>
                </div>
            </div>

            <div
                className="case-progress-bar-track"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                aria-valuenow={currentStep}
                aria-valuetext={`Step ${currentStep} of ${totalSteps}, ${completionPercent}% complete`}
            >
                <div
                    className="case-progress-bar-fill"
                    style={{ width: `${completionPercent}%` }}
                />
            </div>

            <div className="case-progress-steps">
                <div className="case-progress-connector" aria-hidden="true">
                    <div
                        className="case-progress-connector-fill"
                        style={{ width: `${connectorPercent}%` }}
                    />
                </div>

                {steps.map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;
                    const circleState = isCompleted
                        ? 'completed'
                        : isActive
                            ? 'active'
                            : 'upcoming';

                    return (
                        <button
                            key={step.number}
                            type="button"
                            className={`case-progress-step${isCompleted ? ' case-progress-step--completed' : ''}`}
                            onClick={() => isCompleted && onStepSelect(step.number)}
                            disabled={!isCompleted}
                            aria-current={isActive ? 'step' : undefined}
                            aria-label={`${step.name}: ${isCompleted ? 'completed' : isActive ? 'current step' : 'upcoming'}`}
                        >
                            <span className={`case-progress-step__circle case-progress-step__circle--${circleState}`}>
                                {isCompleted ? <CheckCircle2 size={20} aria-hidden="true" /> : step.number}
                            </span>
                            <span
                                className={`case-progress-step__name${isActive || isCompleted ? ' case-progress-step__name--active' : ''}`}
                            >
                                {step.name}
                            </span>
                            <span className="case-progress-step__desc">{step.desc}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
