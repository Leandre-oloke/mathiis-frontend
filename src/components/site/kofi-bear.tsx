"use client";
/* eslint-disable react-hooks/immutability -- Rive state-machine inputs are mutable handles: setting .value is the API. */

import { useEffect } from 'react';
import { Alignment, Fit, Layout, RuntimeLoader, useRive, useStateMachineInput } from '@rive-app/react-canvas';

// Serve the Rive runtime from our own build instead of the unpkg default.
if (typeof window !== 'undefined') RuntimeLoader.setWasmUrl('/rive/rive.wasm');

const MACHINE = 'State Machine 1';
const layout = new Layout({ fit: Fit.Cover, alignment: Alignment.Center });
const clampLook = (value: number) => Math.max(0, Math.min(90, value));

export type KofiProps = {
  /** Eye direction from 0 (left) to 90 (right); undefined faces the visitor. */
  look?: number;
  /** Looks down, as if reading. */
  reading?: boolean;
  /** Covers his eyes with both paws. */
  handsUp?: boolean;
  /** Each increment plays the "success" reaction once. */
  cheer?: number;
  /** Each increment plays the "fail" reaction once. */
  frown?: number;
  className?: string;
};

// Kofi, the Mathiis guide: "login-screen-character" by JcToon (Rive Community, CC BY 4.0).
export function KofiBear({ look, reading = false, handsUp = false, cheer = 0, frown = 0, className = '' }: KofiProps) {
  const { rive, RiveComponent } = useRive({ src: '/rive/kofi-ours.riv', artboard: 'Artboard', stateMachines: MACHINE, autoplay: true, layout });
  const check = useStateMachineInput(rive, MACHINE, 'Check');
  const eyes = useStateMachineInput(rive, MACHINE, 'Look');
  const paws = useStateMachineInput(rive, MACHINE, 'hands_up');
  const success = useStateMachineInput(rive, MACHINE, 'success');
  const fail = useStateMachineInput(rive, MACHINE, 'fail');

  useEffect(() => { if (paws) paws.value = handsUp; }, [paws, handsUp]);
  useEffect(() => { if (cheer > 0) success?.fire(); }, [success, cheer]);
  useEffect(() => { if (frown > 0) fail?.fire(); }, [fail, frown]);
  useEffect(() => {
    if (!check || !eyes) return;
    // Paws over the eyes win over everything else: no glancing at the pointer.
    if (handsUp) { check.value = false; return; }
    if (look !== undefined) { check.value = true; eyes.value = clampLook(look); return; }
    check.value = reading;
  }, [check, eyes, look, reading, handsUp]);

  return <div className={`kofi-frame ${className}`} role="img" aria-label="L’ours guide de Mathiis"><RiveComponent aria-hidden="true" /></div>;
}
