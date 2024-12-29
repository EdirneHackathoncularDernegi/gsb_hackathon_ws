import React, { useState } from 'react';
import '../styles/careerpath.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CareerPath = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [appliedItems, setAppliedItems] = useState([]);
  const [goals, setGoals] = useState([
    { id: 4, text: 'Siber Güvenlik Uzmanı', completed: false, isAdminControlled: false },
    { id: 3, text: 'Siber Güvenlik çalıştayına katıl', completed: false, isAdminControlled: false },
    { id: 2, text: 'En az 2 konferansa git', completed: true, isAdminControlled: true },
    { id: 1, text: 'Siber Güvenlik Temelleri eğitimini izle', completed: true, isAdminControlled: true },
  ]);
  const handleDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return; // Eğer sürüklenen öğe geçerli bir yere bırakılmadıysa çık
    if (destination.index === source.index) return; // Aynı yere bırakıldıysa hiçbir şey yapma

    // Siber Güvenlik Uzmanını korumak için kontrol
    const draggedGoal = goals[source.index];
    if (draggedGoal.text === 'Siber Güvenlik Uzmanı') return;

    const reorderedGoals = Array.from(goals);

    // Siber Güvenlik Uzmanı en üstte kalacak
    const uzmanGoal = reorderedGoals.find((goal) => goal.text === 'Siber Güvenlik Uzmanı');
    const uzmanIndex = reorderedGoals.indexOf(uzmanGoal);

    // Öğeyi yeniden sıralıyoruz
    const [removed] = reorderedGoals.splice(source.index, 1);
    reorderedGoals.splice(destination.index, 0, removed);

    setGoals(reorderedGoals);
  };

  const [newGoalText, setNewGoalText] = useState('');
  const [showAddGoalInput, setShowAddGoalInput] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleApply = (item) => {
    if (appliedItems.includes(item)) {
      setPopupMessage('Zaten başvurdunuz!');
    } else {
      setPopupMessage('Başvurunuz alınmıştır! Sizinle en kısa sürede iletişime geçilecektir.');
      setAppliedItems([...appliedItems, item]);
    }
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  // CV yükleme fonksiyonu
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    alert(`${file.name} başarıyla yüklendi.`);
  };

  // Yeni hedef ekleme
  const handleAddGoal = () => {
    if (newGoalText.trim() === '') {
      alert('Lütfen bir hedef giriniz.');
      return;
    }
    const newGoal = { id: Date.now(), text: newGoalText, completed: false, isAdminControlled: false };

    const uzmanIndex = goals.findIndex((goal) => goal.text === 'Siber Güvenlik Uzmanı');

    const updatedGoals = [...goals];
    updatedGoals.splice(uzmanIndex + 1, 0, newGoal);
  
    setGoals(updatedGoals);
    setNewGoalText('');
    setShowAddGoalInput(false);
  };



  const toggleCompletion = (id) => {
    setGoals(goals.map((goal) =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };
  return (
    <div className="career-path">
      {/* Sol Taraf */}
      <div className="left-section">
        <h2>Tam Sana Uygun</h2>

        <div className="section">
          <h3>Kurslar</h3>
          <div className="items-grid">
            <div className="item-card">
              <h4>Siber Güvenlik 101</h4>
              <p>Tarih: 01.01.2025</p>
              <p>Saat: 15:00</p>
              <button
                className={appliedItems.includes('Siber Güvenlik 101') ? 'applied' : ''}
                onClick={() => handleApply('Siber Güvenlik 101')}
                disabled={appliedItems.includes('Siber Güvenlik 101')}
              >
                {appliedItems.includes('Siber Güvenlik 101') ? 'Başvurdun' : 'Başvur'}
              </button>
            </div>
            <div className="item-card">
              <h4>Web Geliştirme</h4>
              <p>Tarih: 02.01.2025</p>
              <p>Saat: 18:00</p>
              <button
                className={appliedItems.includes('Web Geliştirme') ? 'applied' : ''}
                onClick={() => handleApply('Web Geliştirme')}
                disabled={appliedItems.includes('Web Geliştirme')}
              >
                {appliedItems.includes('Web Geliştirme') ? 'Başvurdun' : 'Başvur'}
              </button>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Konferanslar</h3>
          <div className="items-grid">
            <div className="item-card">
              <h4>AI Konferansı</h4>
              <p>Tarih: 03.01.2025</p>
              <p>Saat: 14:00</p>
              <button
                className={appliedItems.includes('AI Konferansı') ? 'applied' : ''}
                onClick={() => handleApply('AI Konferansı')}
                disabled={appliedItems.includes('AI Konferansı')}
              >
                {appliedItems.includes('AI Konferansı') ? 'Başvurdun' : 'Başvur'}
              </button>
            </div>
            <div className="item-card">
              <h4>Blockchain Teknolojisi</h4>
              <p>Tarih: 05.01.2025</p>
              <p>Saat: 10:00</p>
              <button
                className={appliedItems.includes('Blockchain Teknolojisi') ? 'applied' : ''}
                onClick={() => handleApply('Blockchain Teknolojisi')}
                disabled={appliedItems.includes('Blockchain Teknolojisi')}
              >
                {appliedItems.includes('Blockchain Teknolojisi') ? 'Başvurdun' : 'Başvur'}
              </button>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Çalıştaylar</h3>
          <div className="items-grid">
            <div className="item-card">
              <h4>Siber Güvenlik Çalıştayı</h4>
              <p>Tarih: 10.01.2025</p>
              <p>Saat: 09:00</p>
              <button
                className={appliedItems.includes('Siber Güvenlik Çalıştayı') ? 'applied' : ''}
                onClick={() => handleApply('Siber Güvenlik Çalıştayı')}
                disabled={appliedItems.includes('Siber Güvenlik Çalıştayı')}
              >
                {appliedItems.includes('Siber Güvenlik Çalıştayı') ? 'Başvurdun' : 'Başvur'}
              </button>
            </div>
            <div className="item-card">
              <h4>Yapay Zeka Çalıştayı</h4>
              <p>Tarih: 12.01.2025</p>
              <p>Saat: 11:00</p>
              <button
                className={appliedItems.includes('Yapay Zeka Çalıştayı') ? 'applied' : ''}
                onClick={() => handleApply('Yapay Zeka Çalıştayı')}
                disabled={appliedItems.includes('Yapay Zeka Çalıştayı')}
              >
                {appliedItems.includes('Yapay Zeka Çalıştayı') ? 'Başvurdun' : 'Başvur'}
              </button>
            </div>
          </div>
        </div>

        <div className="cv-actions">
          <button onClick={() => document.getElementById('file-upload').click()}>CV Yükle</button>
          <input
            type="file"
            id="file-upload"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button>CV Oluştur</button>
        </div>
      </div>

      {/* Sağ Taraf */}
      <div className="right-section">
        <h2>Hedeflerim</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="goals">
          {(provided) => (
            <div className="roadmap" {...provided.droppableProps} ref={provided.innerRef}>
              {goals.map((goal, index) => (
                <Draggable key={goal.id} draggableId={goal.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className={`roadmap-item ${
                        goal.completed ? 'completed' : ''
                      } ${snapshot.isDragging ? 'dragging' : ''}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div
                        className={`goal-icon ${
                          goal.completed ? 'completed-icon' : ''
                        }`}
                        onClick={() => toggleCompletion(goal.id)}
                      />
                      <span>{goal.text}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
        <div className="goal-actions">
          {showAddGoalInput ? (
            <div className="add-goal">
              <input
                type="text"
                placeholder="Yeni hedef giriniz"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
              />
              <button onClick={handleAddGoal}>Ekle</button>
            </div>
          ) : (
            <button onClick={() => setShowAddGoalInput(true)}>Hedef Ekle</button>
          )}
        </div>
      </div>

      {showPopup && <div className="popup">{popupMessage}</div>}
    </div>
  );
};

export default CareerPath;

