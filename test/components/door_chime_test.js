import React from "react"
import sinon from "sinon"

import DoorChime from "../../web/static/js/components/door_chime"
import enterSound from "../../web/static/js/components/enter_sound"
import exitSound from "../../web/static/js/components/exit_sound"

describe("DoorChime component", () => {
  let audioElement

  describe("the underlying audio element", () => {
    let clock

    beforeEach(() => {
      clock = sinon.useFakeTimers()
      audioElement = mountWithConnectedSubcomponents(<DoorChime users={[]} />).getDOMNode()
    })

    it("is muted on component mount", () => {
      expect(audioElement.muted).to.equal(true)
    })

    it("is unmuted after a timeout to allow the initial users list to render unheard", () => {
      clock.tick(1600)
      expect(audioElement.muted).to.equal(false)
      clock.restore()
    })
  })

  describe(".componentWillReceiveProps", () => {
    let doorChimeWrapper

    beforeEach(() => {
      doorChimeWrapper = mountWithConnectedSubcomponents(<DoorChime users={[]} />)
      audioElement = doorChimeWrapper.getDOMNode()
      audioElement.play = sinon.spy()
    })

    describe("when the audio element has a non-zero readyState", () => {
      it("plays chime when the user list length changes", () => {
        Object.defineProperty(audioElement, "readyState", {
          get() { return 5 },
        })

        expect(audioElement.play.called).to.equal(false)
        doorChimeWrapper.setProps({ users: [{ name: "Hilly" }] })
        expect(audioElement.play.called).to.equal(true)
      })

      it("plays enter chime when the user list length increases", () => {
        Object.defineProperty(audioElement, "readyState", {
          get() { return 5 },
        })

        doorChimeWrapper.setProps({ users: [{ name: "Hilly" }] })
        expect(audioElement.src).to.equal(enterSound)
      })

      it("plays exit chime when the user list length decreases", () => {
        doorChimeWrapper.setProps({ users: [{ name: "Hilly" }, { name: "Billy" }] })
        Object.defineProperty(audioElement, "readyState", {
          get() { return 5 },
        })

        doorChimeWrapper.setProps({ users: [{ name: "Hilly" }] })
        expect(audioElement.src).to.equal(exitSound)
      })
    })

    describe("when the audio element has a readyState of zero", () => {
      it("does not play the chime sound when the user list length changes", () => {
        Object.defineProperty(audioElement, "readyState", {
          get() { return 0 },
        })

        doorChimeWrapper.setProps({ users: [{ name: "Danny" }] })
        expect(audioElement.play.called).to.equal(false)
      })
    })
  })
})
