from pathlib import Path
path = Path(r'e:\mba\app\templates\facu\placement.html')
text = path.read_text(encoding='utf-8')
start = '    <div class="image-upload-grid">'
end = '  </section>\n</main>\n{% endblock %}'
idx = text.find(start)
if idx == -1:
    raise ValueError('START not found')
end_idx = text.find(end, idx)
if end_idx == -1:
    raise ValueError('END not found')
end_idx += len(end)
new = '''    <div class="image-upload-grid">
      {% if placementcompany_images %}
        {% for image_name in placementcompany_images %}
          <div class="image-upload-block">
            <img src="{{ url_for('static', filename='placementcompany/' ~ image_name) }}" alt="{{ image_name }}" loading="lazy">
          </div>
        {% endfor %}
      {% else %}
        <div class="image-upload-block">No placement images found.</div>
      {% endif %}
    </div>
  </section>
</main>
{% endblock %}'''
path.write_text(text[:idx] + new + text[end_idx:], encoding='utf-8')
print('UPDATED')
