import { useEffect, useLayoutEffect, useMemo, useRef, type DependencyList } from 'react'
import * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import type { Vec3 } from './layout'

export interface InstanceItem {
  p: Vec3
  r?: Vec3
  s?: number | Vec3
  c?: THREE.ColorRepresentation
  /** Colour multiplier (values > 1 bloom on unlit materials). */
  ci?: number
}

type MeshProps = Omit<ThreeElements['instancedMesh'], 'args' | 'ref'>

interface Props extends MeshProps {
  geometry: THREE.BufferGeometry
  material: THREE.Material
  items: InstanceItem[]
  meshRef?: React.Ref<THREE.InstancedMesh>
}

const dummy = new THREE.Object3D()
const color = new THREE.Color()

/** One draw call for many copies of a geometry; matrices are written once. */
export function Instanced({ geometry, material, items, meshRef, ...rest }: Props) {
  const local = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = local.current
    if (!mesh) return
    items.forEach((it, i) => {
      dummy.position.set(...it.p)
      dummy.rotation.set(...(it.r ?? [0, 0, 0]))
      if (typeof it.s === 'number' || it.s === undefined) dummy.scale.setScalar(it.s ?? 1)
      else dummy.scale.set(...it.s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      if (it.c !== undefined) mesh.setColorAt(i, color.set(it.c).multiplyScalar(it.ci ?? 1))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])

  return (
    <instancedMesh
      ref={(m) => {
        local.current = m
        if (typeof meshRef === 'function') meshRef(m)
        else if (meshRef) (meshRef as React.MutableRefObject<THREE.InstancedMesh | null>).current = m
      }}
      args={[geometry, material, items.length]}
      {...rest}
    />
  )
}

/** useMemo for GPU resources: disposes the previous value and on unmount. */
export function useDisposable<T extends { dispose(): void }>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps)
  useEffect(() => () => value.dispose(), [value])
  return value
}
