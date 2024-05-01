'use client'

import Voice, {MessageTranscript} from '../components/Voice'
import Slideshow, {skipToSlide} from '../components/Slideshow'
import {useEffect, useState} from 'react'
import {RetellWebClient} from 'retell-client-js-sdk'

import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels'
import Sidebar from '../components/Sidebar'
import NavBar from '../navBar/NavBar'

function page() {
  const [retellClient, setRetellClient] = useState<RetellWebClient | undefined>(
    undefined,
  )
  const [funcCallSocket, setFuncCallSocket] = useState<WebSocket | undefined>(
    undefined,
  )

  const [messages, setMessages] = useState<MessageTranscript[]>([])

  const getSlideIndex = () => {
    const {searchParams} = new URL(window.location.href)
    const slide_index = searchParams.get('slideIndex')
    return slide_index ? parseInt(slide_index) : 0
  }

  var theLecture: Lecture | undefined = {
    title: 'Introduction to Red-Black Trees',
    description:
      'Exploring the world of balanced search trees and their efficient operations',
    slides: [
      {title: 'Red-Black Trees: Intro in 4', template_id: 4, images: []},
      {
        title: 'Binary Search Trees',
        template_id: 0,
        texts: [
          'Ordered binary trees',
          'Smaller items to the left',
          'Larger items to the right',
        ],
        speaker_notes:
          'Binary search trees are fundamental data structures that maintain order among their elements. Each node in the tree has at most two children, with smaller values residing in the left subtree and larger values in the right subtree. This property enables efficient searching, insertion, and deletion operations.',
        images: [
          {
            src: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/20221215114732/bst-21.png',
            description:
              'This image illustrates a Binary Search Tree (BST), a fundamental data structure used in computer science for managing sorted data efficiently. Each node in the tree contains a key greater than all the keys in the left subtree and less than those in the right subtree, as depicted by nodes like 8 (root), 3, 10, and their respective child nodes, making searches, insertions, and deletions efficient operations.',
          },
          {
            src: 'https://media.geeksforgeeks.org/wp-content/uploads/20221128124311/insertion.png',
            description:
              'This image depicts two binary trees and shows the operation of inserting a new node with the value 40 into the tree. The left tree represents the original structure, and the right tree shows the new structure post-insertion, where 40 has been added as a child of node 30, maintaining the properties of a binary tree.',
          },
          {
            src: 'https://media.geeksforgeeks.org/wp-content/uploads/20230726182925/d1.png',
            description:
              'This image illustrates the process of deleting a leaf node in a Binary Search Tree (BST), specifically demonstrating the deletion of the node containing the value 20. The left side of the image shows the original BST with the node 20 highlighted for deletion, and the right side shows the resultant BST after the node has been effectively removed by setting it to null, maintaining the structural integrity of the BST.',
          },
        ],
      },
      {
        title: 'Balanced Search Trees',
        template_id: 2,
        texts: [
          'Guaranteed height of O(log n)',
          'Efficient search, insert, and delete',
          'Red-black trees are a type of balanced search tree',
        ],
        image:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Red-black_tree_example.svg/512px-Red-black_tree_example.svg.png',
        speaker_notes:
          'Balanced search trees, such as red-black trees, address the potential issue of unbalanced binary search trees, where the height can become linear in the worst case. They ensure a logarithmic height, leading to efficient operations with a time complexity of O(log n) for searching, insertion, and deletion.',
        images: [
          {
            src: 'https://media.geeksforgeeks.org/wp-content/uploads/20221221160923/UntitledDiagramdrawio-660x371.png',
            description:
              'This image depicts two diagrams of binary trees, one balanced and one unbalanced, showing the depth differences between the left and right child of each node, which is crucial for understanding how balance is maintained in the tree structure.',
          },
          {
            src: 'https://algs4.cs.princeton.edu/33balanced/images/23tree-search.png',
            description:
              'This image shows two search scenarios within a 2-3 tree, displaying both a successful search and an unsuccessful attempt, which helps illustrate the search dynamics in a balanced search tree.',
          },
          {
            src: 'https://static.javatpoint.com/ds/images/balanced-binary-search-tree.png',
            description:
              'The image displays a binary tree structure efficiently demonstrating how nodes are organized in a balanced manner, suitable for illustrating basic tree structures and balancing concepts.',
          },
        ],
      },
      {
        title: 'Red-Black Tree Properties',
        template_id: 9,
        texts: [
          'Nodes are red or black',
          'Root and leaves are black',
          'Red nodes have black children',
          'Equal black nodes on all paths',
        ],
        image:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Red-black_tree_example.svg/512px-Red-black_tree_example.svg.png',
        speaker_notes:
          'Red-black trees maintain a set of properties that ensure balance and efficient operations. These properties include: nodes being either red or black, the root and leaves (null nodes) always being black, red nodes having black children, and all paths from a node to its descendant leaves containing the same number of black nodes.',
        images: [
          {
            src: 'https://media.geeksforgeeks.org/wp-content/uploads/20200427100650/red-black-tree.png',
            description:
              'This image depicts a red-black tree, a type of self-balancing binary search tree, where each node contains a color (either red or black) and a numeric value, and additionally pointers to left and right child nodes or NIL if no child exists. This particular structure ensures that the tree remains approximately balanced, which allows it to maintain efficient search, insertion, and deletion operations, making it relevant and valuable for various computational algorithms and software applications that require fast data retrieval and manipulation.',
          },
          {
            src: 'https://www.codesdope.com/staticroot/images/ds/rb8.png',
            description:
              'This image displays a collection of circles with numbers inside, which could represent nodes in a graph, and numbers placed seemingly arbitrarily around those nodes, potentially indicating weights or values associated with either the nodes or edges in a network. Several circles are connected by directional arrows to a central rectangular box with a number inside, possibly indicating some form of calculation or function acting upon those specific nodes, relevant to understanding or demonstrating principles of graph theory or network flows in applied mathematics or computer science.',
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Red-black_tree_example.svg',
            description:
              'This image is typically used to illustrate the structure and properties of red-black trees, including the color coding of nodes and the balance of the tree.',
          },
        ],
      },
      {
        title: 'Black Height',
        template_id: 1,
        texts: [
          'Number of black nodes on a path',
          'Does not include the root',
          'Longest path is at most twice as long as the shortest path',
        ],
        image:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Red-black_tree_example.svg/512px-Red-black_tree_example.svg.png',
        speaker_notes:
          'The black height of a red-black tree refers to the number of black nodes on any path from the root to a leaf (null node), excluding the root itself. This property ensures that the tree remains balanced, with the longest path being at most twice as long as the shortest path.',
        images: [
          {
            src: 'maxresdefault.jpg',
            description:
              "This image illustrates a red-black tree, demonstrating the concept of 'Black Height,' which is the count of black nodes from the root node to each leaf node, excluding the root itself. Paths traced in red and each terminating with a count of 2 visibly show the black height for each path.",
          },
        ],
      },
      {
        title: 'Operations on Red-Black Trees',
        template_id: 0,
        texts: [
          'Search, insert, and remove',
          'Search is similar to BSTs',
          'Insert and remove require rotations',
          'Time complexity of O(log n)',
        ],
        speaker_notes:
          'Red-black trees support the standard search, insert, and remove operations found in binary search trees. Searching remains efficient, while insertion and removal may involve rotations to maintain the red-black tree properties and ensure balance.',
        images: [
          {
            src: 'https://media.geeksforgeeks.org/wp-content/uploads/20200506190350/output244.png',
            description:
              "The image depicts a transformation of a Red-Black tree involving a right rotation and a color swap between the nodes. Initially, the tree shows a red node (P) with a left child (X) also colored red, which violates the Red-Black tree properties; the 'Uncle is Black' indication leads to a right rotation around the grandparent (G) and a subsequent color swap that rectifies this property violation, resulting in a balanced tree structure.",
          },
          {
            src: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/rbdelete161-1024x704.png',
            description:
              "The image illustrates the process of deleting a node from a red-black tree, focusing on the rebalancing required to maintain the properties of the tree. Specifically, it shows how the tree is adjusted after deleting node 10, moving from a violation of red-black properties to a balanced state, following specific rebalancing cases labeled as 'Case 3.2.c(ii)' and transitioning to 'Case 3.2.b.'",
          },
          {
            src: 'https://www.codesdope.com/staticroot/images/ds/rb20.png',
            description:
              'The image displays three configurations of interconnected nodes and edges, which appear to represent different graph structures. The nodes in each of the configurations are labeled with numbers, possibly indicating weight, value, or identifier, and these structures could be relevant to prompts regarding graph theory, network analysis, or algorithms focusing on node interconnectivity and graph traversal techniques.',
          },
          {
            src: 'https://media.geeksforgeeks.org/wp-content/uploads/20200427100650/red-black-tree.png',
            description:
              'This image shows a red-black tree, a type of self-balancing binary search tree, with each node containing an integer. The black and red nodes denote the coloring rule for red-black trees, where each red node must have black children, used to maintain a balanced tree height for efficient operations like insertion, deletion, and lookup.',
          },
        ],
      },
      {
        title: 'Rotations',
        template_id: 8,
        image:
          'https://www.geeksforgeeks.org/wp-content/uploads/20220914143442/Red-Black-Tree-Rotations.png',
        speaker_notes:
          'Rotations are essential operations in red-black trees to maintain balance after insertions and deletions. They involve rearranging nodes and updating colors to preserve the red-black tree properties. Different types of rotations, such as left rotations and right rotations, are used depending on the specific situation.',
        images: [
          {
            src: 'https://i.ytimg.com/vi/NhtTKhP3d6s/maxresdefault.jpg',
            description:
              'A visual explanation of 180-degree geometric rotations on a coordinate plane, demonstrating how shapes are transformed by turning around a fixed point.',
          },
        ],
      },
      {
        title: 'Space and Time Complexity',
        template_id: 2,
        texts: [
          'Space complexity: O(n)',
          'Time complexity: O(log n)',
          'Efficient for large datasets',
        ],
        speaker_notes:
          'Red-black trees have a space complexity of O(n) due to storing n nodes. Their time complexity for search, insert, and remove operations is O(log n), making them highly efficient for managing large datasets and ensuring fast retrieval times.',
        images: [
          {
            src: 'https://cdn.hackr.io/uploads/posts/attachments/1650358110m7fPqMdxs5.png',
            description:
              'Data Structures Complexity Table: A comprehensive table summarizing different data structures along with their time and space complexity for operations like indexing, search, insertion, and deletion, color-coded for efficiency.',
          },
          {
            src: 'https://he-s3.s3.amazonaws.com/media/uploads/ece920b.png',
            description:
              'Big-O Complexity Graph: A graph demonstrating how the number of operations relates to the number of elements for various complexity functions including O(1), O(logn), O(n), O(n logn), O(n^2), O(2^n), and O(n!).',
          },
          {
            src: 'https://miro.medium.com/v2/resize:fit:962/1*WLMogyCDtB3ZM5z_LxpD4w.png',
            description:
              'Big O Notation Efficiency: This image shows various complexity curves like O(n), O(log n), O(n log n), and assesses their efficiency with labels indicating their desirability in algorithm design.',
          },
        ],
      },
    ],
  }

  const handleFuncCallResult = (result: FunctionCall) => {
    if (theLecture) {
      const curr_slide = getSlideIndex()
      switch (result.name) {
        case 'next_slide':
          // If the slide is not the last one, skip to the next slide
          if (curr_slide + 1 < theLecture.slides.length) {
            skipToSlide(curr_slide + 1)
          }
          break
        case 'prev_slide':
          // If the slide is not the first one, skip to the previous slide
          if (curr_slide - 1 >= 0) {
            skipToSlide(curr_slide - 1)
          }
          break
        case 'goto_slide':
          const slide_number = result.arguments['slide_number']
          // If the slide number is within the bounds of the slides array, skip to that slide
          if (slide_number >= 0 && slide_number < theLecture.slides.length) {
            skipToSlide(result.arguments['slide_number'])
          }
          break
        case 'new_slide':
          if (theLecture) {
            const newSlide: Slide = {
              title: result.arguments.lecture.slides[0].title,
              template_id: result.arguments.lecture.slides[0].template_id,
              images: result.arguments.lecture.slides[0].images,
              texts: result.arguments.lecture.slides[0].texts,
              speaker_notes: result.arguments.lecture.slides[0].speaker_notes,
              image: result.arguments.lecture.slides[0].image,
            }
            theLecture.slides.splice(curr_slide + 1, 0, newSlide)
            localStorage.setItem('lecture', JSON.stringify(theLecture))
            skipToSlide(curr_slide + 1)
          }
          break
      }
    } else {
      alert('No lecture provided.')
    }
  }

  // Have the voice AI speak the slide speaker notes if you change slides
  const handleSlideChange = (slideIndex: number) => {
    if (theLecture) {
      console.log('Current slide number:', slideIndex)
      const slide = theLecture.slides[slideIndex]
      const speaker_notes = slide.speaker_notes || slide.title
      if (speaker_notes) {
        funcCallSocket?.send(speaker_notes)
      }
    } else {
      alert('No lecture provided.')
    }
  }

  // When data socket connects, read first slide
  const handleDataSocketConnect = () => {
    if (theLecture) {
      setTimeout(() => {
        const slide_number = getSlideIndex()
        const slide = theLecture!.slides[slide_number]
        console.log('CONVERSATION STARTED', slide)
        const speaker_notes = slide.speaker_notes || slide.title
        if (speaker_notes) {
          funcCallSocket?.send(speaker_notes)
        }
      }, 5000)
    } else {
      alert('No lecture provided.')
    }
  }

  // If last message equals current slide speaker notes, slide has finished so time to move oon
  const handleUpdate = (update: {transcript: MessageTranscript[]}) => {
    if (theLecture) {
      setMessages(update.transcript)

      const lastMessage = update.transcript[update.transcript.length - 1]

      const slide_number = getSlideIndex()
      const slide = theLecture.slides[slide_number]
      const speaker_notes = slide.speaker_notes || slide.title

      if (lastMessage.content.includes(speaker_notes!)) {
        // If the slide is not the last one, skip to the next slide
        if (slide_number + 1 < theLecture.slides.length) {
          setTimeout(() => {
            skipToSlide(slide_number + 1)
          }, 2500)
        }
      }
    } else {
      alert('No lecture provided.')
    }
  }

  return (
    <main className="flex flex-col h-full w-full">
      <PanelGroup direction="vertical">
        <Panel defaultSize={100}>
          <PanelGroup direction="horizontal">
            <Panel minSize={25} defaultSize={100}>
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold py-4">
                  {theLecture?.title ?? 'Could not generate'}
                </h1>
                <div className="w-full h-min relative flex  items-center justify-center">
                  <div className="absolute z-20 h-full top-0 left-0 w-full flex items-center justify-center">
                    <Voice
                      onFuncCallResult={handleFuncCallResult}
                      onDataSocketConnect={handleDataSocketConnect}
                      funcCallSocket={funcCallSocket}
                      retellClient={retellClient}
                      setFuncCallSocket={setFuncCallSocket}
                      setRetellClient={setRetellClient}
                      onUpdate={handleUpdate}
                    />
                  </div>
                  {!funcCallSocket && (
                    <div className="absolute z-10 h-full top-0 left-0 w-full bg-white/75"></div>
                  )}
                  <Slideshow
                    lecture={
                      theLecture ?? {
                        title: 'Could not generate',
                        description: 'Could not generate',
                        slides: [],
                      }
                    }
                    onSlideChange={handleSlideChange}
                  />
                </div>
                <h3 className="text-lg text-center">
                  Ask questions about this by interrupting the lecture
                </h3>
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel
              id="sidebar"
              defaultSize={messages.length > 0 ? 25 : 0}
              minSize={messages.length > 0 ? 25 : 0}
            >
              <Sidebar messages={messages} />
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={0}>
          <h1></h1>
        </Panel>
      </PanelGroup>
    </main>
  )
}

export default page
