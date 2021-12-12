import { useState } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'

export function DraggableItems<T>({
  itemComponent,
  items,
  dragHandleSelector,
  onOrderChange,
}: {
  items: T[]
  itemComponent: (item: T, i: number) => JSX.Element
  dragHandleSelector: string
  onOrderChange?: (items: T[], removeIndex: number, insertIndex: number) => void
}) {
  const [itemsCopy, setItems] = useState([...items])

  const onDrop = ({ removedIndex, addedIndex }) => {
    setItems((itemsCopy) => {
      const startIndex =
        removedIndex < 0 ? items.length + removedIndex : removedIndex
      if (startIndex >= 0 && startIndex < items.length) {
        const endIndex = addedIndex < 0 ? items.length + addedIndex : addedIndex
        if (startIndex != endIndex) {
          itemsCopy = [...itemsCopy]
          const [item] = itemsCopy.splice(removedIndex, 1)
          itemsCopy.splice(endIndex, 0, item)
          onOrderChange?.(itemsCopy, startIndex, endIndex)
        }
      }
      return itemsCopy
    })
  }

  return (
    <Container
      dragHandleSelector={dragHandleSelector}
      lockAxis="y"
      onDrop={onDrop}
    >
      {items.map((item, i) => {
        const Item = itemComponent(item, i)
        return <Draggable key={i}>{Item}</Draggable>
      })}
    </Container>
  )
}
