import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blossomGeometry, leafGeometry } from '../geometry'
import { clayMaterial } from '../materials'
import { useDisposable } from '../Instanced'
import type { Vec3 } from '../layout'

export interface Bloom {
  p: Vec3
  s: number
  c: THREE.ColorRepresentation
  /** Rotation of the blossom (default faces +Z). */
  r?: Vec3
  leaf?: boolean
}

interface Props {
  items: Bloom[]
  /** Returns 0..1 growth; flowers scale in as the guest arrives (reversible). */
  growth?: () => number
}

const dummy = new THREE.Object3D()
const col = new THREE.Color()

/** Instanced blossoms + leaves for garlands, arches and the wishing tree. */
export function Blossoms({ items, growth }: Props) {
  const flowers = useMemo(() => items.filter((i) => !i.leaf), [items])
  const leaves = useMemo(() => items.filter((i) => i.leaf), [items])
  const fRef = useRef<THREE.InstancedMesh>(null)
  const lRef = useRef<THREE.InstancedMesh>(null)
  const geos = useDisposable(() => {
    const b = blossomGeometry()
    const l = leafGeometry()
    return { b, l, dispose: () => (b.dispose(), l.dispose()) }
  }, [])
  const mats = useDisposable(() => {
    const f = clayMaterial({ selfGlow: 0.32, rim: '#fff8ee', rimStrength: 0.3 })
    const l = clayMaterial({ color: '#7fae8c', rim: '#c9f0d4', rimStrength: 0.25 })
    return { f, l, dispose: () => (f.dispose(), l.dispose()) }
  }, [])
  const last = useRef(-1)

  const write = (g: number) => {
    const apply = (mesh: THREE.InstancedMesh | null, list: Bloom[], colors: boolean) => {
      if (!mesh) return
      list.forEach((it, i) => {
        dummy.position.set(...it.p)
        dummy.rotation.set(...(it.r ?? [Math.PI / 2, 0, 0]))
        // Stagger growth so flowers pop in one after another.
        const stagger = THREE.MathUtils.clamp(g * 1.6 - (i / list.length) * 0.6, 0, 1)
        dummy.scale.setScalar(it.s * (growth ? stagger * stagger * (3 - 2 * stagger) : 1))
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        if (colors) mesh.setColorAt(i, col.set(it.c))
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      mesh.computeBoundingSphere()
    }
    apply(fRef.current, flowers, last.current < 0)
    apply(lRef.current, leaves, false)
    last.current = g
  }

  useLayoutEffect(() => {
    last.current = -1
    write(growth ? growth() : 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useFrame(() => {
    if (!growth) return
    const g = Math.round(growth() * 200) / 200
    if (g !== last.current) write(g)
  })

  return (
    <>
      <instancedMesh ref={fRef} args={[geos.b, mats.f, flowers.length]} />
      <instancedMesh ref={lRef} args={[geos.l, mats.l, leaves.length]} />
    </>
  )
}
