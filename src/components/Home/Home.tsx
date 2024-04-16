import useMultiStepForm from "../../hooks/useMultiStepForm";
import RecipeBuilder from "./RecipeBuilder";
import { RecipeData } from "../../App";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import MainInputs from "../Nutrients/MainInputs";
import AdvancedInputForm from "../Nutrients/AdvancedInputForm";
import NutrientCalcResults from "../Nutrients/NutrientCalcResults";
import useMaxGpl from "../../hooks/useMaxGpl";
import { initialData } from "../Nutrients/initialData";
import { useTranslation } from "react-i18next";
import { FormData } from "../Nutrients/NutrientCalc";

export default function Home({
  recipeData,
  setRecipeData,
}: {
  recipeData: RecipeData;
  setRecipeData: Dispatch<SetStateAction<RecipeData>>;
}) {
  const { t } = useTranslation();
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    if (advanced) setYanFromSource([0, 0, 0]);
    else setYanFromSource(null);
  }, [advanced]);

  const [yanContribution, setYanContribution] = useState([40, 100, 210]);
  const [yanFromSource, setYanFromSource] = useState<number[] | null>(null);
  const [data, setData] = useState<FormData>({
    ...initialData,
    inputs: {
      ...initialData.inputs,
      volume: recipeData.volume,
      sg: recipeData.OG - recipeData.FG + 1,
      offset: recipeData.offset,
    },
    selected: {
      ...initialData.selected,
      volumeUnits: recipeData.units.volume,
    },
  });
  const maxGPL = useMaxGpl(
    data.maxGpl,
    data.selected.schedule,
    data.inputs?.sg
  );

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        volume: recipeData.volume,
        sg: Math.round((recipeData.OG - recipeData.FG + 1) * 1000) / 1000,
        offset: Math.round(recipeData.offset * 100) / 100,
      },
      selected: {
        ...prev.selected,
        volumeUnits: recipeData.units.volume,
      },
    }));
  }, [
    recipeData.volume,
    recipeData.OG,
    recipeData.FG,
    recipeData.offset,
    recipeData.units.volume,
  ]);

  const { next, back, step, currentStepIndex, steps } = useMultiStepForm([
    <RecipeBuilder {...recipeData} setRecipeData={setRecipeData} />,
    <>
      <MainInputs {...data} setData={setData} />
      <button
        onClick={() => setAdvanced((prev) => !prev)}
        className="hover:bg-background rounded-2xl border-2 border-solid hover:border-textColor  bg-sidebar border-background md:text-lg text-base px-2 py-1 disabled:bg-sidebar disabled:hover:border-textColor disabled:hover:text-sidebar disabled:cursor-not-allowed w-1/4"
      >
        {t("buttonLabels.advanced")}
      </button>
      {advanced && (
        <AdvancedInputForm
          advanced={advanced}
          yanFromSource={yanFromSource}
          setYanFromSource={setYanFromSource}
          yanContribution={yanContribution}
          setYanContribution={setYanContribution}
        />
      )}{" "}
    </>,
    <NutrientCalcResults
      {...data}
      {...maxGPL}
      yanFromSource={yanFromSource}
      advanced={advanced}
    />,
  ]);
  return (
    <div className="w-full flex flex-col items-center justify-center mt-12 mb-12">
      {step}
      {currentStepIndex > 0 && (
        <button
          className="hover:bg-background rounded-2xl border-2 border-solid hover:border-textColor  bg-sidebar border-background md:text-lg text-base px-2 py-1 disabled:bg-sidebar disabled:hover:border-textColor disabled:hover:text-sidebar disabled:cursor-not-allowed w-1/4"
          onClick={back}
        >
          {t("buttonLabels.back")}
        </button>
      )}
      {currentStepIndex < steps.length - 1 && (
        <button
          className="hover:bg-background rounded-2xl border-2 border-solid hover:border-textColor  bg-sidebar border-background md:text-lg text-base px-2 py-1 disabled:bg-sidebar disabled:hover:border-textColor disabled:hover:text-sidebar disabled:cursor-not-allowed w-1/4 mb-[3rem]"
          onClick={() => {
            setData((prev) => ({
              ...prev,
              yanContribution,
            }));
            next();
          }}
        >
          {t("buttonLabels.next")}
        </button>
      )}
    </div>
  );
}
