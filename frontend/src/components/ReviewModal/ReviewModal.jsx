import { useModal } from "../../context/Modal";


function ReviewModal() {
   const { closeModal } = useModal()
    const handleSubmitReview = (e) => {
        e.preventDefault();
        closeModal();
    }

  return (
      <>
          <form onSubmit={handleSubmitReview}>
              <textarea></textarea>
              <input type="range" min="1" max="5" />
              <button type="submit">Submit</button>
          </form>
      </>
  )
}

export default ReviewModal
