import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useEventListener } from './hooks/useEventListener'
import IsDevice from './helpers/IsDevice.js'

/**
 * Cursor Core
 * Replaces the native cursor with a custom animated cursor, consisting
 * of an inner and outer dot that scale inversely based on hover or click.
 *
 * @author Stephen Scaff (github.com/stephenscaff)
 *
 * @param {string} color - rgb color value
 * @param {number} innerAlpha - level of alpha transparency for color
 * @param {number} innerBorder - border size for inner circle
 * @param {number} innerBorderColor - border color for inner circle (can be any color, not only rgb, to allow transparent values)
 * @param {string} outerColor - rgb outer color value, defaults to color
 * @param {number} outerAlpha - level of alpha transparency for outerColor
 * @param {number} outerBorder - border size for outer circle
 * @param {number} outerBorderColor - border color for outer circle (can be any color, not only rgb, to allow transparent values)
 * @param {number} innerSize - inner cursor size in px
 * @param {number} innerScale - inner cursor scale amount
 * @param {number} outerSize - outer cursor size in px
 * @param {number} outerScale - outer cursor scale amount
 *
 */
function CursorCore({
  color = '220, 90, 90',
  outerColor = '0, 0, 0',
  innerAlpha = 1,
  outerAlpha = 0,
  innerBorder = 0,
  innerBorderColor = 'transparent',
  outerBorder = 1,
  outerBorderColor = 'rgb(220, 90, 90)',
  innerSize = 8,
  innerScale = 0.7,
  outerSize = 25,
  outerScale = 2,
  trailingSpeed = 8
}) {
  const cursorOuterRef = useRef()
  const cursorInnerRef = useRef()
  const requestRef = useRef()
  const previousTimeRef = useRef()
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [isActiveClickable, setIsActiveClickable] = useState(false)
  let endX = useRef(0)
  let endY = useRef(0)

  // Primary Mouse Move event
  const onMouseMove = useCallback(({ clientX, clientY }) => {
    setCoords({ x: clientX, y: clientY })
    cursorInnerRef.current.style.top = `${clientY}px`
    cursorInnerRef.current.style.left = `${clientX}px`
    endX.current = clientX
    endY.current = clientY
  }, [])

  // Outer Cursor Animation Delay
  const animateOuterCursor = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        coords.x += (endX.current - coords.x) / trailingSpeed
        coords.y += (endY.current - coords.y) / trailingSpeed
        cursorOuterRef.current.style.top = `${coords.y}px`
        cursorOuterRef.current.style.left = `${coords.x}px`
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animateOuterCursor)
    },
    [requestRef] // eslint-disable-line
  )

  // RAF for animateOuterCursor
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateOuterCursor)
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [animateOuterCursor])

  // Mouse Events State updates
  const onMouseDown = useCallback(() => {
    setIsActive(true)
  }, [])

  const onMouseUp = useCallback(() => {
    setIsActive(false)
  }, [])

  const onMouseEnterViewport = useCallback(() => {
    setIsVisible(true)
  }, [])

  const onMouseLeaveViewport = useCallback(() => {
    setIsVisible(false)
  }, [])

  useEventListener('mousemove', onMouseMove)
  useEventListener('mousedown', onMouseDown)
  useEventListener('mouseup', onMouseUp)
  useEventListener('mouseover', onMouseEnterViewport)
  useEventListener('mouseout', onMouseLeaveViewport)

  // Cursors Hover/Active State
  useEffect(() => {
    if (isActive) {
      cursorInnerRef.current.style.width = innerSize * innerScale + 'px';
    cursorInnerRef.current.style.height = innerSize * innerScale + 'px';
    cursorOuterRef.current.style.width = outerSize * outerScale + 'px';
      cursorOuterRef.current.style.height = outerSize * outerScale + 'px';
    } else {
    cursorInnerRef.current.style.width = innerSize + 'px';
    cursorInnerRef.current.style.height = innerSize + 'px';
    cursorOuterRef.current.style.width = outerSize + 'px';
    cursorOuterRef.current.style.height = outerSize + 'px';
    }
  }, [innerScale, outerScale, isActive])

  // Cursors Click States
  useEffect(() => {
    if (isActiveClickable) {
      cursorInnerRef.current.style.width = innerSize * innerScale * 1.2 + 'px';
      cursorInnerRef.current.style.height = innerSize * innerScale * 1.2 + 'px';
      cursorOuterRef.current.style.width = outerSize * outerScale * 1.4 + 'px';
      cursorOuterRef.current.style.height = outerSize * outerScale * 1.4 + 'px';
    }
  }, [innerScale, outerScale, isActiveClickable])

  // Cursor Visibility State
  useEffect(() => {
    if (isVisible) {
      cursorInnerRef.current.style.opacity = 1
      cursorOuterRef.current.style.opacity = 1
    } else {
      cursorInnerRef.current.style.opacity = 0
      cursorOuterRef.current.style.opacity = 0
    }
  }, [isVisible])

  // Target all possible clickables
  useEffect(() => {
    const clickables = document.querySelectorAll(
      'a, input[type="submit"], input[type="image"], label[for], select, button, .link'
    )
    clickables.forEach((el) => {
      el.style.cursor = 'none'

      el.addEventListener('mouseover', () => {
        setIsActive(true)
      })
      el.addEventListener('click', () => {
        setIsActive(true)
        setIsActiveClickable(false)
      })
      el.addEventListener('mousedown', () => {
        setIsActiveClickable(true)
      })
      el.addEventListener('mouseup', () => {
        setIsActive(true)
      })
      el.addEventListener('mouseout', () => {
        setIsActive(false)
        setIsActiveClickable(false)
      })
    })

    return () => {
      clickables.forEach((el) => {
        el.removeEventListener('mouseover', () => {
          setIsActive(true)
        })
        el.removeEventListener('click', () => {
          setIsActive(true)
          setIsActiveClickable(false)
        })
        el.removeEventListener('mousedown', () => {
          setIsActiveClickable(true)
        })
        el.removeEventListener('mouseup', () => {
          setIsActive(true)
        })
        el.removeEventListener('mouseout', () => {
          setIsActive(false)
          setIsActiveClickable(false)
        })
      })
    }
  }, [isActive])

  // Cursor Styles
  const styles = {
    cursorInner: {
      zIndex: 999,
      display: 'block',
      position: 'fixed',
      borderRadius: '50%',
      width: innerSize,
      height: innerSize,
      pointerEvents: 'none',
      backgroundColor: `rgba(${color}, ${innerAlpha})`,
    border: `${innerBorder}px solid ${innerBorderColor}`,
    transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.15s ease-in-out, width 0.25s ease-in-out, height 0.25s ease-in-out'
    },
    cursorOuter: {
      zIndex: 999,
      display: 'block',
      position: 'fixed',
      borderRadius: '50%',
      pointerEvents: 'none',
      width: outerSize,
      height: outerSize,
      backgroundColor: `rgba(${outerColor ? outerColor : color}, ${outerAlpha})`,
    border: `${outerBorder}px solid ${outerBorderColor}`,
    transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.15s ease-in-out, width 0.15s ease-in-out, height 0.15s ease-in-out',
      willChange: 'width,height'
    }
  }

  // Hide / Show global cursor
  document.body.style.cursor = 'none'

  return (
    <React.Fragment>
      <div ref={cursorOuterRef} style={styles.cursorOuter} />
      <div ref={cursorInnerRef} style={styles.cursorInner} />
    </React.Fragment>
  )
}

/**
 * AnimatedCursor
 * Calls and passes props to CursorCore if not a touch/mobile device.
 */
function AnimatedCursor({
  color = '220, 90, 90',
  outerColor = '0, 0, 0',
  innerAlpha = 1,
  outerAlpha = 0,
  innerBorder = 0,
  innerBorderColor = 'transparent',
  outerBorder = 1,
  outerBorderColor = 'rgb(220, 90, 90)',
  innerSize = 8,
  innerScale = 0.7,
  outerSize = 25,
  outerScale = 2,
  trailingSpeed = 8
}) {
  if (typeof navigator !== 'undefined' && IsDevice.any()) {
    return <React.Fragment></React.Fragment>
  }
  return (
    <CursorCore
      color={color}
      innerAlpha={innerAlpha}
      innerBorder={innerBorder}
      innerBorderColor={innerBorderColor}
      outerColor={outerColor}
      outerAlpha={outerAlpha}
      outerBorder={outerBorder}
      outerBorderColor={outerBorderColor}
      innerSize={innerSize}
      innerScale={innerScale}
      outerSize={outerSize}
      outerScale={outerScale}
      trailingSpeed={trailingSpeed}
    />
  )
}

export default AnimatedCursor
