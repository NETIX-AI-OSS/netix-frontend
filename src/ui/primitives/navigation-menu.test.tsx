import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from './navigation-menu'

const tree = (viewport: boolean) => (
  <NavigationMenu viewport={viewport} className="root">
    <NavigationMenuList className="list">
      <NavigationMenuItem className="item">
        <NavigationMenuTrigger className="trigger">Products</NavigationMenuTrigger>
        <NavigationMenuContent className="content">
          <NavigationMenuLink className="link" href="/a">
            A
          </NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuIndicator className="indicator" />
    </NavigationMenuList>
  </NavigationMenu>
)

describe('NavigationMenu', () => {
  it.each([true, false])('renders with viewport=%s', (viewport) => {
    render(tree(viewport))
    const root = document.querySelector('[data-slot="navigation-menu"]')
    expect(root).toHaveClass('root')
    expect(root).toHaveAttribute('data-viewport', String(viewport))
    expect(document.querySelector('[data-slot="navigation-menu-list"]')).toHaveClass('list')
    expect(screen.getByRole('button', { name: /Products/ })).toHaveClass('trigger')
  })

  it('renders a standalone viewport', () => {
    render(
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/a">A</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport className="vp" />
      </NavigationMenu>,
    )
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute(
      'data-slot',
      'navigation-menu-link',
    )
  })

  it('exposes the trigger style recipe', () => {
    expect(navigationMenuTriggerStyle()).toContain('inline-flex')
  })
})
